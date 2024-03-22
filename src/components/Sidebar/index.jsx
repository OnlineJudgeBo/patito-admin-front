import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="flex-1 p-4 flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800">
            <div className="flex flex-col w-64 bg-white border-r">
                <div className="flex items-center justify-center h-14 border-b">
                    <div className="text-lg font-semibold">Panel de Control</div>
                </div>
                <div className="overflow-y-auto overflow-x-hidden flex-grow">
                    <ul className="flex flex-col py-4 space-y-1">

                        <li>
                            <Link to="/admin" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/speedometer2.svg" className="w-5 h-5" alt="Dashboard Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Dashboard</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/users" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/person-lines-fill.svg" className="w-5 h-5" alt="Gestión de Usuarios Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Gestión de Usuarios</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/roles" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/key.svg" className="w-5 h-5" alt="Roles y Permisos Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Roles y Permisos</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/management" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/person-badge-fill.svg" className="w-5 h-5" alt="Gestión de Administradores Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Gestión de Administradores</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/problems" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/journal-code.svg" className="w-5 h-5" alt="Problemas Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Problemas</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/problems/add" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/plus-circle-fill.svg" className="w-5 h-5" alt="Agregar Problema Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Agregar Problema</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/problems/rejudge" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/arrow-repeat.svg" className="w-5 h-5" alt="Rejuez Problemas Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Rejuez Problemas</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/contests" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/trophy-fill.svg" className="w-5 h-5" alt="Concursos Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Concursos</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/admin/contests/add" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/plus-circle-fill.svg" className="w-5 h-5" alt="Crear Concurso Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Crear Concurso</span>
                            </Link>
                        </li>


                        <li>
                            <Link to="/admin/logout" className="flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                                <span className="inline-flex justify-center items-center ml-4">
                                    <img src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/icons/box-arrow-right.svg" className="w-5 h-5" alt="Cerrar Sesión Icon" />
                                </span>
                                <span className="ml-2 text-sm font-medium tracking-wide truncate">Cerrar Sesión</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
