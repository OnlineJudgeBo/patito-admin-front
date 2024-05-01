import { apiService } from '../../services/apiService';

export default class MyUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(file => {
            return new Promise((resolve, reject) => {
                const data = new FormData();
                data.append('file', file);

                apiService.postFile("filemanager/cloud-storage", data)
                    .then(result => {
                        resolve({
                            default: result
                        });
                    })
                    .catch(error => {
                        reject('Error al cargar el archivo.');
                        console.error('Error uploading image:', error);
                    });
            });
        });
    }
}
