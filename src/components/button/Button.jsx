import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ type, padding, margin, icon, text, path, onClick, size, rounded }) => {
    const buttonClass = `
        ${rounded === 'full' ? 'rounded-full' : 'rounded-2xl'}
        ${type === 'normal' ? 'bg-azul/90 dark:bg-azul/50 hover:bg-azul dark:hover:bg-azul/40 text-white dark:text-white/80' : ''} 
        ${type === 'alt' ? 'bg-gray-200 dark:bg-gray-200/5 lg:bg-gray-200/40 hover:bg-gray-300/60 dark:hover:bg-gray-500/5 text-gray-400 dark:text-white/80 ' : ''} 
        ${type === 'success' ? 'bg-green-600/50 text-white' : ''} 
        ${type === 'danger' ? 'bg-red-600/50 text-red-500' : ''} 
        ${size === 'full' ? 'w-full' : 'w-fit'} 
        ${size === 'fit' ? 'w-fit' : 'w-fit'} 
    `;

    return (
        <>
            {path ?
                <Link
                    to={path}
                    onClick={onClick}
                    className={`flex justify-center text-lg cursor-pointer backdrop-blur-md ripple ripple ${buttonClass} ${padding} ${margin}`}
                >
                    <div className='my-auto'>{icon}</div>
                    <span className='my-auto  whitespace-nowrap'>{text}</span>
                </Link>
                :
                <div
                    onClick={onClick}
                    className={`flex justify-center text-xl cursor-pointer backdrop-blur-md ripple ripple ${buttonClass} ${padding} ${margin}`}
                >
                    <div className='my-auto'>{icon}</div>
                    <span className='my-auto whitespace-nowrap'>{text}</span>
                </div>
            }
        </>
    );
};

export default Button;
