# /* *********************************************************************** *
#  * Code developed to : TrafficSim-Vis							             *
#  *         A work of : Visual Analytics of Traffic Simulation Data         *
#  * *********************************************************************** *
#  *                                                                         *                          
#  * Author            : Christopher Almachi                                 *
#  *                                                                         *
#  * *********************************************************************** *
#  *                                                                         *
#  *   This code was developed to process data from MATSim outputs. And its  *
#  *   main purpose is to achieve the visualization of the simulations       *
#  *   through a single-page application.                                    *
#  *                                                                         *
#  *   To run it you only need:                                              *
#  *    - configure the coordenates that you want. Example: epsg:32717  in   *
#  *         crs_source = Proj(init='epsg:32717')                            *
#  *                                                                         *
#  *    run:                                                                 *
#  *   $ python name_script.py <output_network.xml.g> <output_events.xml.gz> *
#  *                                                                         *
#  * *********************************************************************** */

# libraries
import sys
import argparse
import json
import gzip
import math
import shutil
import matsim
import pandas as pd
from pyproj import Transformer
import xml.etree.ElementTree as ET
from pyproj import Proj, transform
from collections import defaultdict

net = None


def process_network(input_network_file):
    # Read network file
    global net
    net = matsim.read_network(input_network_file)

    # Set coordinates
    crs_source = Proj(init='epsg:32717') # Cuenca
    crs_target = Proj(init='epsg:4326')

    def transform_coordinates(row):
        x, y = row['x'], row['y']
        lon, lat = transform(crs_source, crs_target, x, y)
        return lon, lat

    net.nodes['longitude'], net.nodes['latitude'] = zip(*net.nodes.apply(transform_coordinates, axis=1))

    # Generate parsed network file
    feature_collection = {
        "type": "FeatureCollection",
        "features": []
    }

    node_mapping = {(node["node_id"]): {"longitude": (node["longitude"]), "latitude": (node["latitude"])} for _, node in net.nodes.iterrows()}

    for _, node in net.nodes.iterrows():
        feature = {
            "type": "Feature",
            "properties": {
                "id": (node["node_id"])
            },
            "geometry": {
                "type": "Point",
                "coordinates": [(node["longitude"]), (node["latitude"])]
            }
        }
        feature_collection["features"].append(feature)

    for _, link in net.links.iterrows():
        from_coordinates = [node_mapping[(link["from_node"])]["longitude"], node_mapping[(link["from_node"])]["latitude"]]
        to_coordinates = [node_mapping[(link["to_node"])]["longitude"], node_mapping[(link["to_node"])]["latitude"]]

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [from_coordinates, to_coordinates]
            },
            "properties": {
                "id": (link["link_id"]),
                "from": (link["from_node"]),
                "to": (link["to_node"]),
                "length": float(link["length"]),
                "freespeed": float(link["freespeed"]),
                "capacity": float(link["capacity"]),
                "permlanes": float(link["permlanes"]),
                "oneway": int(link["oneway"]),
                "modes": (link["modes"])
            }
        }
        feature_collection["features"].append(feature)

    with open('parsing_network.json', 'w') as json_file:
        json.dump(feature_collection, json_file, separators=(',', ':'))
    print(f"  ")
    print(f"Network file generated successfully.")




#__________________________________________________________________________________________________________

def process_events(output_events_file):
    global net
    events = matsim.event_reader(output_events_file, types=('entered link'))
    df_events = pd.DataFrame(events)


    # Drop unnecessary columns
    row_del_events = ['type']
    df_events = df_events.drop(columns=row_del_events)

    row_del_links  = ['to_node','length','freespeed','capacity','permlanes','oneway','modes']
    net.links = net.links.drop(columns=row_del_links)

    row_del_nodes  = ['x','y']
    net.nodes = net.nodes.drop(columns=row_del_nodes)
    df_events = df_events.rename(columns={'link': 'link_id'})
    df_events = df_events.merge(net.links, on='link_id', how='left')
    df_events = df_events.rename(columns={'from_node': 'node_id'})
    df_events = df_events.merge(net.nodes, on='node_id', how='left')

    # Generate parsed event(s) file necessary for the simulation
    batchesEvent=1000000
    total_parts = math.ceil(len(df_events) / batchesEvent)

    for part in range(total_parts):
        start_index = part * batchesEvent
        end_index = min((part + 1) * batchesEvent, len(df_events))

        df_subset = df_events.iloc[start_index:end_index]

        json_data = []

        for vehicle_id, group in df_subset.groupby('vehicle'):
            path_data = {
                "vehicle": str(vehicle_id),
                "path": group[['longitude', 'latitude']].values.tolist(),
                "timestamps": group['time'].tolist()
            }
            json_data.append(path_data)

        with open(f'parser_events_part_{part + 1}.json', 'w') as json_file:
            json.dump(json_data, json_file, separators=(',', ':'))

        print(f"Part {part + 1} from Event file generated successfully.")



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process MATSim network and events files.')
    parser.add_argument('network_file', type=str, help='Path to the MATSim network file (output_network.xml.gz)')
    parser.add_argument('events_file', type=str, help='Path to the MATSim events file (output_events.xml.gz)')
    args = parser.parse_args()

    process_network(args.network_file)
    process_events(args.events_file)
    print("********************************************************")
    print("* Your files are ready to be upload to TrafficSim-Vis! *")
    print("********************************************************")