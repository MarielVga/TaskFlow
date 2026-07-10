
class Tarea {
    constructor(title, description, date, estado = 'pendiente'){
        this.title = title;
        this.description = description;
        this.date = new Date().toLocaleString;
        this.estado = estado;
    }

    cambiarEstado() {
        this.estado = this.estado === 'pendiente' ? 'completada' : 'pendiente';
    }
}

class GestorTareas {
    constructor(){
        this.tareas = [];
        this.cargarLocalStorage();
    }

    agregarTarea(nuevaTarea) {
        this.tareas = [...this.tareas, nuevaTarea];
        this.guardarLocalStorage();
        this.renderizarTarea();
    }

    eliminarTarea(title){
        this.tareas = this.tareas.filter(tarea => tarea.title !== title);
        this.guardarLocalStorage();
        this.renderizarTarea();
    }

    guardarLocalStorage() {
        localStorage.setItem('taskflow_tareas', JSON.stringify(this.tareas));
    }

    cargarLocalStorage() {
        const datosGuardados = JSON.parse(localStorage.getItem('taskflow_tareas')) || [];
        
        this.tareas = datosGuardados.map(({ title, description, date, estado }) => {
            return new Tarea(title, description, date, estado);
        });
        this.renderizarTarea();
    }

    async obtenerTareasAPI() {
        try {
            const respuesta = await fetch();
            const datos = await respuesta.json();

            datos.array.forEach(item => {
                const { titulo, completed } = item;
                const nuevaTareaApi = new Tarea(Date.now() + Math.random(), title, completed ? 'completada' : 'pendiente');

                this.tareas.push(nuevaTareaApi);
            });

            this.guardarLocalStorage();
            this.renderizarTarea();
            mensaje("Tareas importadas desde la API");

        } catch(error) {
            console.error("Error al obtener la API: ", error);
            mensaje("Error al conectar con la API");
        }
    }

    renderizarTarea(){
        const listaDOM = document.getElementById("lista-tareas");
        listaDOM.innerHTML = '';

        this.tareas.forEach( tarea => {
            const li = document.createElement('li');

            li.className = `tarea-item ${tarea.estado === 'completada' ? 'completada' : '' }`;

            li.innerHTML = `
                    <strong>${tarea.description}</strong>
                    <br> <small>Creada: ${tarea.date}</small></br>
                    <button onclick="completarTarea(${tarea.title}")> Completado</button>
                    <button onclick="borrarTarea(${tarea.title}")> Eliminar</button>
                `;
            
            li.addEventListener('mouseover', () => li.classList.add('highlight'));
            li.addEventListener('mouseout', () => li.classList.remove('highlight'));
            listaDOM.appendChild(li);

        });
    }
}