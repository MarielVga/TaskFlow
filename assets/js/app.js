// clase para definir la estructura de cada tarea
class Tarea {
    // constructor para recibir y asignar valores
    constructor(id, title, description, date, estado = 'pendiente'){
        // asignacion de parametros
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.estado = estado;
    }

    // metodo para alternar estado de la tarea
    cambiarEstado() {
        // uso de ternario para cambiar entre pendiente y completada
        this.estado = this.estado === 'pendiente' ? 'completada' : 'pendiente';
    }
}

// clase principal para amnejar todas las tareas
class GestorTareas {
    constructor(){
        // inicializamos un arreglo de tareas vacio
        this.tareas = [];
        // cargamos la memoria
        this.cargarLocalStorage();
    }

    // metodo para agregar tarea
    agregarTarea(nuevaTarea) {
        // copiamos el arreglo de tareas y agregamos una nueva
        this.tareas = [...this.tareas, nuevaTarea];
        // guardamos en memoria
        this.guardarLocalStorage();
        // dibujar lista en HTML
        this.renderizarTarea();
    }

    // metodo para borrar tarea
    eliminarTarea(id){
        // filtra y conserva las tareas que no tengan el id a borrar
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
        // actualiza memoria y dibuja
        this.guardarLocalStorage();
        this.renderizarTarea();
    }

    // metodo para completar una tarea
    completarTarea(id){
        // busca la tarea que coincida con el id
        const tarea = this.tareas.find(t => t.id === id);

        // si la encuentra, ejecuta el cambio
        if (tarea) {
            // cambio de estados y actualizacion
            tarea.cambiarEstado()
            this.guardarLocalStorage();
            this.renderizarTarea();
        }
    }

    // metodo para persistir los datos en el navegador
    guardarLocalStorage() {
        // convierte arreglo de objetos a JSON
        localStorage.setItem('taskflow_tareas', JSON.stringify(this.tareas));
    }

    // metodo para leer los datos guardados
    cargarLocalStorage() {
        // convierte nuevamente el texto a codigo, y si es null, asigna arreglo vacio
        const datosGuardados = JSON.parse(localStorage.getItem('taskflow_tareas')) || [];
        
        // reconstruimos cada objeto de la instancia tarea
        this.tareas = datosGuardados.map(({ id, title, description, date, estado }) => {
            return new Tarea(id, title, description, date, estado);
        });

        // dibuja la tarea recuperada
        this.renderizarTarea();
    }

    // async para hacer peticiones
    async obtenerTareasAPI() {
        // bloque try para intentar la conexion
        try {
            // llamo algunas tareas para no llenar la pantalla
            const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
            // transformamos la respuesta a formato JSON
            const datos = await respuesta.json();
            
            // verificamos que la respuesta sea exitosa
            if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
            
            // transformamos el arreglo de la API en mi arreglo Tarea
            const tareasImportadas = datos.map(item => {
                // destructurado de valores que trae la API
                const {id, title, completed } = item;

                // retorno del objeto instanciado
                return new Tarea(
                    // generamos un id con el timstamp actual
                    `api-${id}-${Date.now()}`,
                    title,
                    "Importada desde JSONPlaceholder",
                    // generamos la fecha en formato compatible
                    new Date().toISOString.slice(0,16),
                    // adaptamos estado booleano
                    completed ? 'completada' : 'pendiente'
                );
            });

            // juntamos tareas locales con las importadas
            this.tareas = [...this.tareas, ...tareasImportadas]

            this.guardarLocalStorage();
            this.renderizarTarea();

            // mensaje de exito
            alert("Tareas importadas desde la API");

        } catch(error) {
            // si falla el fetch arroja mensaje de error
            console.error("Error al obtener la API: ", error);
            alert("Error al conectar con la API");
        }
    }

    // metodo para inyectar al DOM
    renderizarTarea(){
        // capturamos la etiqueta ul
        const listaDOM = document.getElementById("lista-tareas");
        // limpiamos la lista para no duplicar elementos
        listaDOM.innerHTML = '';

        // iteramos cada tarea guardada
        this.tareas.forEach( tarea => {
            // se crea etiqueta li
            const li = document.createElement('li');

            // inyectamos clases y id oculto
            li.className = `tarea-item ${tarea.estado === 'completada' ? 'completada' : '' }`;
            li.dataset.id = tarea.id;

            // inyectamos HTML interno del li
            li.innerHTML = `
                    <strong>${tarea.title}</strong> - ${tarea.description}
                    <br> <small>Asignada el día: ${new Date(tarea.date).toLocaleString()}</small></br>
                    <button class="btn-completar"> Completado</button>
                    <button class="btn-eliminar"> Eliminar</button>
                `;
            // eventos visuales
            li.addEventListener('mouseover', () => li.classList.add('highlight'));
            li.addEventListener('mouseout', () => li.classList.remove('highlight'));
            
            // pegamos el li dentro del ul
            listaDOM.appendChild(li);
        });
    }
}

// evento inicial para asegurar que cargue el HTML
document.addEventListener('DOMContentLoaded', () =>{
    // instanciamos la clase principal
    const gestor = new GestorTareas();
    // capturamos el form
    const form = document.getElementById('task-form');

    // crear tarea
    form.addEventListener('submit', (e) =>{
        // bloqueamos recarga de la pagina
        e.preventDefault();

        // captura de valores ingresados
        const title = document.getElementById('input-title').value;
        const description = document.getElementById('input-description').value;
        const date = document.getElementById('input-date').value;

        // generamos el id con la hora actual
        const id = Date.now().toString();

        // creamos el nuevo objeto
        const nuevaTarea = new Tarea(id, title, description, date);

        // se manda al gestor y se limpia el form
        gestor.agregarTarea(nuevaTarea);
        form.reset();
    });

    // delegacion de eventos para los botones de la lista
    document.getElementById('lista-tareas').addEventListener('click', (e) => {
        // buscamos el li mas cercano de donde se hizo click
        const itemContenedor = e.target.closest('.tarea-item');

        // si clickeamos afuera de la tarea corta la ejecucion
        if (!itemContenedor) return;

        // sacamos el id de la tarea clickeada
        const idTarea = itemContenedor.dataset.id;

        // comprueba si el click fue en completar
        if (e.target.classList.contains('btn-completar')){
            gestor.completarTarea(idTarea);
        }

        // comprueba si el click fue en eliminar
        if (e.target.classList.contains('btn-eliminar')){
            gestor.eliminarTarea(idTarea);
        }
    });
});