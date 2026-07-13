class Tarea {
    // constructor para recibir y asignar valores
    constructor(id, title, description, date, estado = 'pendiente'){
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.estado = estado;
    }

    // metodo para alternar estado de la tarea
    cambiarEstado() {
        this.estado = this.estado === 'pendiente' ? 'completada' : 'pendiente';
    }
}

class GestorTareas {
    constructor(){
        // inicializamos un arreglo de tareas vacio
        this.tareas = [];
        // cargamos la memoria
        this.cargarLocalStorage();
    }

    agregarTarea(nuevaTarea) {
        // copiamos el arreglo de tareas y agregamos una nueva
        this.tareas = [...this.tareas, nuevaTarea];
        this.guardarLocalStorage();
        // dibujar lista en HTML
        this.renderizarTarea();
    }

    eliminarTarea(id){
        // filtra y conserva las tareas que no tengan el id a borrar
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
        this.guardarLocalStorage();
        this.renderizarTarea();
    }

    completarTarea(id){
        // busca la tarea que coincida con el id
        const tarea = this.tareas.find(t => t.id === id);

        if (tarea) {
            tarea.cambiarEstado()
            this.guardarLocalStorage();
            this.renderizarTarea();
        }
    }

    guardarLocalStorage() {
        // convierte arreglo de objetos a JSON
        localStorage.setItem('taskflow_tareas', JSON.stringify(this.tareas));
    }

    cargarLocalStorage() {
        // convierte nuevamente el texto a codigo, y si es null, asigna arreglo vacio
        const datosGuardados = JSON.parse(localStorage.getItem('taskflow_tareas')) || [];
        
        // reconstruimos cada objeto de la instancia tarea
        this.tareas = datosGuardados.map(({ id, title, description, date, estado }) => {
            return new Tarea(id, title, description, date, estado);
        });
        this.renderizarTarea();
    }

    // async para hacer peticiones
    async obtenerTareasAPI() {
        try {
            // llamo 5 para no llenar la pantalla
            const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
            // transformamos la respuesta a formato JSON
            const datos = await respuesta.json();
            
            // verificamos que la respuesta sea exitosa
            if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
            
            // transformamos el arreglo de la API en mi arreglo Tarea
            const tareasImportadas = datos.map(item => {
                const {id, title, completed } = item;

                return new Tarea(
                    // generamos un id con el timstamp actual
                    `api-${id}-${Date.now()}`,
                    title,
                    "Importada desde JSONPlaceholder",
                    // generamos la fecha en formato compatible
                    new Date().toISOString.slice(0,16),
                    completed ? 'completada' : 'pendiente'
                );
            });

            // juntamos tareas locales con las importadas
            this.tareas = [...this.tareas, ...tareasImportadas]

            this.guardarLocalStorage();
            this.renderizarTarea();

            alert("Tareas importadas desde la API");

        } catch(error) {
            // si falla el fetch arroja mensaje de error
            console.error("Error al obtener la API: ", error);
            alert("Error al conectar con la API");
        }
    }

    renderizarTarea(){
        // capturamos la etiqueta ul
        const listaDOM = document.getElementById("lista-tareas");
        // limpiamos la lista para no duplicar elementos
        listaDOM.innerHTML = '';

        // iteramos cada tarea guardada
        this.tareas.forEach( tarea => {
            // se crea etiqueta li
            const li = document.createElement('li');

            li.className = `tarea-item ${tarea.estado === 'completada' ? 'completada' : '' }`;
            li.dataset.id = tarea.id;

            // inyectamos HTML interno del li
            li.innerHTML = `
                    <strong>${tarea.title}</strong> - ${tarea.description}
                    <br> <small>Creada: ${tarea.date}</small></br>
                    <button class="btn-completar"> Completado</button>
                    <button class="btn-eliminar"> Eliminar</button>
                `;
            // eventos visuales
            li.addEventListener('mouseover', () => li.classList.add('highlight'));
            li.addEventListener('mouseout', () => li.classList.remove('highlight'));
            
            listaDOM.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () =>{
    const gestor = new GestorTareas();
    const form = document.getElementById('task-form');

    // crear tarea
    form.addEventListener('submit', (e) =>{
        e.preventDefault();

        const title = document.getElementById('input-title').value;
        const description = document.getElementById('input-description').value;
        const date = document.getElementById('input-date').value;

        const id = Date.now().toString();

        const nuevaTarea = new Tarea(id, title, description, date);

        gestor.agregarTarea(nuevaTarea);
        form.reset();
    });

    document.getElementById('lista-tareas').addEventListener('click', (e) => {
        const itemContenedor = e.target.closest('.tarea-item');

        if (!itemContenedor) return;

        const idTarea = itemContenedor.dataset.id;

        if (e.target.classList.contains('btn-completar')){
            gestor.completarTarea(idTarea);
        }

        if (e.target.classList.contains('btn-eliminar')){
            gestor.eliminarTarea(idTarea);
        }

    });
});