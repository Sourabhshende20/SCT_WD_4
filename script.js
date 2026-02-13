const list=document.getElementById("taskList");

function saveTasks(){
    localStorage.setItem("tasks",list.innerHTML);
}

function loadTasks(){
    list.innerHTML=localStorage.getItem("tasks")||"";
    attachEvents();
    updateStats();
}

window.onload=loadTasks;

function addTask(){
    if(!taskInput.value.trim()) return;

    const li=document.createElement("li");
    li.draggable=true;

    const priority=document.getElementById("priority").value;
    const date=taskDate.value;

    li.innerHTML=`
    <div>
        ${taskInput.value}
        <span class="priority ${priority}">${priority}</span>
        <br><small>${date?new Date(date).toLocaleString():""}</small>
    </div>

    <div class="actions">
        <button class="done">✓</button>
        <button class="delete">X</button>
    </div>
    `;

    list.appendChild(li);
    taskInput.value="";
    taskDate.value="";

    attachEvents();
    updateStats();
    saveTasks();
}

function attachEvents(){
    document.querySelectorAll(".done").forEach(b=>{
        b.onclick=e=>{
            e.target.closest("li").classList.toggle("completed");
            updateStats();
            saveTasks();
        }
    });

    document.querySelectorAll(".delete").forEach(b=>{
        b.onclick=e=>{
            e.target.closest("li").remove();
            updateStats();
            saveTasks();
        }
    });

    dragDrop();
}

function clearAll(){
    list.innerHTML="";
    updateStats();
    saveTasks();
}

function updateStats(){
    const total=list.children.length;
    const done=document.querySelectorAll(".completed").length;
    counter.textContent=`Total: ${total} | Completed: ${done}`;
    progressBar.style.width=total?(done/total*100)+"%":"0%";
}

function dragDrop(){
    const items=document.querySelectorAll("#taskList li");

    items.forEach(item=>{
        item.ondragstart=()=>item.classList.add("drag");
        item.ondragend=()=>{
            item.classList.remove("drag");
            saveTasks();
        }
    });

    list.ondragover=e=>{
        e.preventDefault();
        const after=getDragAfter(e.clientY);
        const drag=document.querySelector(".drag");
        if(after==null) list.appendChild(drag);
        else list.insertBefore(drag,after);
    }
}

function getDragAfter(y){
    const els=[...document.querySelectorAll("#taskList li:not(.drag)")];
    return els.reduce((c,child)=>{
        const box=child.getBoundingClientRect();
        const offset=y-box.top-box.height/2;
        if(offset<0 && offset>c.offset){
            return{offset:offset,element:child};
        }else return c;
    },{offset:-9999}).element;
}

function startVoice(){
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){alert("Voice recognition not supported");return;}

    const recog=new SpeechRecognition();
    recog.lang="en-US";

    recog.onresult=e=>{
        taskInput.value=e.results[0][0].transcript;
    };

    recog.start();
}
