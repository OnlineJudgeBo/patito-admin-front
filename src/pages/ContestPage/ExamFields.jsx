/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Field } from 'formik';
import { apiService } from '../../services/apiService';

// "Real exam" switch plus the lab IPs whose shared use is expected (IP monitoring ignores them).
export default function ExamFields({ formik }) {
    const [ipMessage, setIpMessage] = useState('');

    // Adds the public IP this browser reaches the server from; meant to be used from inside the lab.
    const addMyIp = () => {
        apiService.get('contests/client-ip')
            .then(({ ip }) => {
                if (!ip || ip === '0.0.0.0') {
                    setIpMessage('No se pudo detectar tu IP pública.');
                    return;
                }
                const current = (formik.values.examLabIps || '').split(/[,\n]/).map(item => item.trim()).filter(Boolean);
                if (!current.includes(ip)) {
                    formik.setFieldValue('examLabIps', [...current, ip].join(', '));
                }
                setIpMessage(`Se agregó ${ip}.`);
            })
            .catch(() => setIpMessage('No se pudo obtener tu IP.'));
    };

    return (
        <div className="mb-4">
            <label htmlFor="isExam" className="inline-flex relative items-center cursor-pointer">
                <Field
                    type="checkbox"
                    id="isExam"
                    name="isExam"
                    className="sr-only peer"
                    checked={formik.values.isExam}
                    onChange={() => formik.setFieldValue('isExam', !formik.values.isExam)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">¿Es un examen real? (monitorear IPs)</span>
            </label>
            {formik.values.isExam && (
                <div className="mt-2">
                    <label htmlFor="examLabIps" className="block text-sm font-medium text-gray-700">IPs del laboratorio (opcional)</label>
                    <Field
                        as="textarea"
                        id="examLabIps"
                        name="examLabIps"
                        rows={2}
                        placeholder="203.0.113.10, 203.0.113.0/24"
                        className="mt-1 p-2 border border-gray-300 rounded-md w-full font-mono text-sm"
                    />
                    <div className="flex items-center gap-3 mt-1">
                        <button type="button" onClick={addMyIp} className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                            Usar mi IP actual
                        </button>
                        {ipMessage && <span className="text-xs text-gray-600">{ipMessage}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        IPs o rangos (CIDR) separados por coma o salto de línea. Usa &quot;Usar mi IP actual&quot; desde el laboratorio. Toda actividad desde otra IP se marcará como sospechosa.
                    </p>
                </div>
            )}
        </div>
    );
}
