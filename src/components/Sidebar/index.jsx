import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`min-h-screen ${isOpen ? 'w-64' : 'w-0'} flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800 transition-all duration-300 ease-in-out`}>
            <div className="flex-none">
                <button onClick={() => setIsOpen(!isOpen)} className="p-4 focus:outline-none focus:bg-gray-200 hover:bg-gray-100">
                    <svg className={`transition-transform transform ${isOpen ? '-rotate-180' : 'rotate-0'} h-6 w-6`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-center h-14 border-b">
                    <div className="text-lg font-semibold">Panel de Control</div>
                </div>
                <ul className="flex flex-col py-4 space-y-1">

                    <div className="px-6 text-xs text-gray-600">General</div>
                    <li>
                        <Link to="/admin" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/speedometer2.svg" className="w-5 h-5" alt="Dashboard Icon" />
                            </span>
                            <span className="ml-2 text-sm font-medium">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/users" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/person-lines-fill.svg" className="w-5 h-5" alt="Gestión de Usuarios Icon" />
                            </span>
                            <span className="ml-2 text-sm font-medium">Gestión de Usuarios</span>
                        </Link>
                    </li>

                    <div className="px-6 text-xs text-gray-600 mt-4">Problemas</div>
                    <li>
                        <Link to="/admin/problems" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/journal-code.svg" className="w-5 h-5" alt="Problemas Icon" />
                            </span>
                            <span className="ml-2 text-sm font-medium">Problemas</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/problems/add" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/plus-circle-fill.svg" className="w-5 h-5" alt="Agregar Problema Icon" />
                            </span>
                            <span className="ml-2 text-sm font-medium">Agregar Problema</span>
                        </Link>
                    </li>

                    <div className="px-6 text-xs text-gray-600 mt-4">Concursos</div>
                    <li>
                        <Link to="/admin/contests" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/trophy-fill.svg" className="w-5 h-5" alt="Concursos Icon" />
                            </span>
                            <span className="ml-2 text-sm font-medium">Concursos</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/contests/add" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/plus-circle-fill.svg" className="w-5 h-5" alt="Crear Concurso Icon" />                            </span>
                            <span className="ml-2 text-sm font-medium">Crear Concurso</span>
                        </Link>
                    </li>
                    <div className="px-6 text-xs text-gray-600 mt-4">Gestión</div>
                    <li>
                        <Link to="/admin/management/users" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/person-lines-fill.svg" className="w-5 h-5" alt="Gestión de Usuarios Icon" />
                            </span>
                            <span className="ml-2 text-sm font-medium">Permisos de Usuario</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/logout" className="group flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                            <span className="inline-flex justify-center items-center ml-4">
                                <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/box-arrow-right.svg" className="w-5 h-5" alt="Cerrar Sesión Icon" />                            </span>
                            <span className="ml-2 text-sm font-medium">Cerrar Sesión</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
