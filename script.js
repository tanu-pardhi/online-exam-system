const API_URL = "https://script.google.com/macros/s/AKfycbwNxWHRIv_cAfmKXu4b1bM0ZiRwZyOV2a4_PEeMOY4VRtEVeAJXFO9r8s-NyGA42qmA/exec";
let studentId="";
let questions=[];
let correctAnswers=[];
let selectedLanguage="";
let timerInterval;
let timeLeft=60;

window.onload=()=>{document.getElementById("loader").style.display="none";}


function registerStudent(){

  const name=document.getElementById("name").value;
  const email=document.getElementById("email").value;
  selectedLanguage=document.getElementById("language").value;

  fetch(`${API_URL}?action=register&name=${name}&email=${email}&language=${selectedLanguage}`)
  .then(res=>res.json())
  .then(data=>{
    studentId=data.studentId;
    loadQuestions();
  });
}

function loadQuestions(){

  fetch(`${API_URL}?action=getQuestions&language=${selectedLanguage}`)
  .then(res=>res.json())
  .then(data=>{
    questions=data;
    correctAnswers=data.map(q=>q.correct);
    showExam();
    startTimer();
  });
}

function showExam(){
  document.getElementById("loginSection").classList.remove("active");
  document.getElementById("examSection").classList.add("active");

  const box=document.getElementById("questionBox");
  box.innerHTML="";

  questions.forEach((q,i)=>{
    box.innerHTML+=`
      <p>${i+1}. ${q.question}</p>
      ${q.options.map(opt=>
        `<label><input type="radio" name="q${i}" value="${opt}"> ${opt}</label><br>`
      ).join("")}
      <br>
    `;
  });
}

function startTimer(){
  timerInterval=setInterval(()=>{
    document.getElementById("timer").innerText=timeLeft+"s";
    if(timeLeft<=0){clearInterval(timerInterval);submitExam();}
    timeLeft--;
  },1000);
}
function submitExam(){

  let answers=[];
  questions.forEach((q,i)=>{
    const sel=document.querySelector(`input[name="q${i}"]:checked`);
    answers.push(sel?sel.value:"");
  });

  fetch(`${API_URL}?action=submitExam&studentId=${studentId}&name=${document.getElementById("name").value}&language=${selectedLanguage}&answers=${encodeURIComponent(JSON.stringify(answers))}&correctAnswers=${encodeURIComponent(JSON.stringify(correctAnswers))}`)
  .then(res=>res.json())
  .then(data=>{
    document.getElementById("examSection").classList.remove("active");
    document.getElementById("resultSection").classList.add("active");

    let html="Score: "+data.score+" | "+data.percentage+"%";

    if(data.certificate){
      html+=`<br><br><a href="${data.certificate}" target="_blank">Download Certificate</a>`;
    }

    document.getElementById("resultText").innerHTML=html;
  });

}
