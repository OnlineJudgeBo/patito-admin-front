import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage() {
    return (
        <div className="grid gap-6 py-8 px-4 sm:px-6 lg:px-8 bg-white shadow-lg rounded-lg max-w-md mx-auto">

            <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Iniciar sesión
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Por favor, ingresa tus credenciales para continuar
                </p>
            </div>
            <form className="mt-8 space-y-6">
                <div className="grid gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <Label htmlFor="name" className="md:w-1/4 text-right">
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Tu nombre"
                            className="md:w-3/4 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <Label htmlFor="username" className="md:w-1/4 text-right">
                            Usuario
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Tu usuario"
                            className="md:w-3/4 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                        />
                    </div>
                    {/* Considera añadir un campo para la contraseña si es un formulario de inicio de sesión */}
                    <div className="flex justify-end mt-4">
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-2 text-white rounded-md px-4 py-2">
                            Iniciar sesión
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;
