const DEV = false;

start();

document.getElementById("logoEgencia").src = "https://www.assystem.com/wp-content/themes/assystem-corpo/dist/images/icons/logo-big.png";

const EXTENSION_ADDED_ATTRIBUTE = "extension_added";
const DONE_ATTRIBUTE = "done";
const DATE_INPUT_ID = "date_input";
const DEV_EMAIL = "antoine@cuffel.fr";

var premier_tableau = null;
var premier_tableau_trs = null;

var deuxieme_tableau = null;
let deuxieme_tableau_trs = null;

let last_day = new Date();

function start(){
  if(DEV){
    const BUTTON = document.createElement("button");
    BUTTON.id = "start_dev_mode";
    BUTTON.onclick = function() {
      dev_launch();
    }
    BUTTON.innerHTML = "Lancer le script";
    document.body.appendChild(BUTTON);
  }
  else{
    // Le deuxième tableau est rempli avec des données récupérées dans une requette AJAX, nous executons donc notre code après.
    let interval = setInterval(function () {
      deuxieme_tableau = document.querySelector("#SoldesAbsencesPerso > tbody");
      deuxieme_tableau_trs = deuxieme_tableau.querySelectorAll("tr");
      if(deuxieme_tableau_trs.length > 1){
        launch();
        clearInterval(interval);
        return;
      }
    }, 100);
  }
}

// Cette fonction répercute les jours "RTT" du deuxième tableau au premier.
function DoRTT(_salaryMode, _value, _statut, _tds){
  const TD1 = premier_tableau_trs[_salaryMode ? 8 : 7].querySelectorAll("td")[3];
  SetTDValue(TD1, (TD1.innerHTML - _value));

  if(_statut.includes("Demande non encore validée ou pointée")){
    const TD2 = premier_tableau_trs[_salaryMode ? 8 : 7].querySelectorAll("td")[2];
    SetTDValue(TD2, (TD2.innerHTML - _value));
  }

  _tds[4].classList.add(DONE_ATTRIBUTE);
}

// Cette fonction répercute les jours "Congés payés" du deuxième tableau au premier.
function DoCP(_statutValideOuPointe, _value){
  const TD1 = premier_tableau_trs[3].querySelectorAll("td")[_statutValideOuPointe ? 3 : 2];
  let value1 = parseFloat((TD1.innerHTML));
  if(value1 - _value < 0){
    const VALUE1bis = value1 - _value;
    value1 = 0;

    const TD1bis = premier_tableau_trs[2].querySelectorAll("td")[_statutValideOuPointe ? 3 : 2];
    const TD1bisValue = parseFloat(TD1bis.innerHTML);
    SetTDValue(TD1bis, (TD1bisValue + VALUE1bis));
  }
  SetTDValue(TD1, (value1 - _value >= 0) ? value1 - _value : 0);
}

// Cette fonction définit le contenu d'une cellule.
function SetTDValue(_td, _value){
  const CLASS_NAME = "negative";
  _td.innerHTML = _value == 0 ? _value : _value.toFixed(2);
  if(_value < 0){
    _td.classList.add(CLASS_NAME);
  }
  else{
    _td.classList.remove(CLASS_NAME);
  }
}

// Cette fonction nettoie la GUI avant de lancer le script.
function dev_launch(){
  document.querySelectorAll("td." + DONE_ATTRIBUTE).forEach(function (element) {
    element.classList.remove(DONE_ATTRIBUTE);
  });
  document.querySelectorAll("." + EXTENSION_ADDED_ATTRIBUTE).forEach(function (element) {
    element.remove();
  });
  launch();
}

function launch(){
  premier_tableau = document.querySelector("#SoldeCongePerso > table > tbody");
  premier_tableau_trs = premier_tableau.querySelectorAll("tr");
  deuxieme_tableau = document.querySelector("#SoldesAbsencesPerso > tbody");
  deuxieme_tableau_trs = deuxieme_tableau.querySelectorAll("tr");

  // Dans cette boucle, nous ajoutons les colonnes vide
  for(let i = 0; i < premier_tableau_trs.length; i++){
    if(i > 0){
      const NAME = premier_tableau_trs[i].querySelectorAll("td")[1].id;
      const INPUT = document.createElement("input");
      INPUT.setAttribute("title", "Renseignez ici le nombre de jours que vous estimez obtenir par mois.");
      INPUT.setAttribute("type", "number");
      INPUT.setAttribute("name", NAME);

      const COOKIE_VALUE = GetCookie(NAME);
      if(COOKIE_VALUE != null && COOKIE_VALUE.length > 0){
        const VALUE = parseFloat(COOKIE_VALUE);
        INPUT.value = VALUE;
      }

      INPUT.onchange = function() {
        SetFutur(this);
      }
      INPUT.classList.add(EXTENSION_ADDED_ATTRIBUTE, "futur");

      // premier_tableau_trs[i].querySelector("td:first-child").appendChild(INPUT);
    }

    let value = "";
    if(i > 0){
      value = parseFloat(premier_tableau_trs[i].querySelectorAll("td")[1].innerHTML.replace(/,/g, '.'));
    }

    // Premiere colonne "Validés ou pointés"
    const FIRST_CONTAINER = document.createElement(i == 0 ? "th" : "td");
    FIRST_CONTAINER.classList.add(EXTENSION_ADDED_ATTRIBUTE);
    if(i == 0){
      FIRST_CONTAINER.setAttribute("title", "Cette colonne contient les congés du dernier bulletin de paie, moins les absences validées ou pointées.");
    }
    FIRST_CONTAINER.appendChild(document.createTextNode(i == 0 ? "Validés ou pointés (?)" : value));
    premier_tableau_trs[i].appendChild(FIRST_CONTAINER);

    // Deuxième colonne "Non encore validés ou pointés"
    const SECOND_CONTAINER = document.createElement(i == 0 ? "th" : "td");
    SECOND_CONTAINER.classList.add(EXTENSION_ADDED_ATTRIBUTE);
    if(i == 0){
      SECOND_CONTAINER.setAttribute("title", "Cette colonne contient les congés du dernier bulletin de paie, moins les absences validées ou pointées et non encore validées ou pointées.");
    }
    SECOND_CONTAINER.appendChild(document.createTextNode(i == 0 ? "Non encore validés ou pointés (?)" : value));
    premier_tableau_trs[i].appendChild(SECOND_CONTAINER);

    // Troisième colonne "Date"
    const TROISIEME_CONTAINER = document.createElement(i == 0 ? "th" : "td");
    TROISIEME_CONTAINER.classList.add(EXTENSION_ADDED_ATTRIBUTE);
    if(i == 0){
      TROISIEME_CONTAINER.setAttribute("title", "Cette colonne contient les congés estimés à la date sélectionnée par l'utilisateur.");

      const INPUT = document.createElement("input");
      INPUT.setAttribute("type", "month");
      INPUT.id = DATE_INPUT_ID;
      INPUT.classList.add("red");
      INPUT.onchange = function() {
        EstimateToDate();
      }
      INPUT.classList.add(EXTENSION_ADDED_ATTRIBUTE, "futur");

      TROISIEME_CONTAINER.appendChild(INPUT);
    }
    else{
      TROISIEME_CONTAINER.appendChild(document.createTextNode(""));
    }
    //premier_tableau_trs[i].appendChild(TROISIEME_CONTAINER);
  }

  for(let i = 1; i < deuxieme_tableau_trs.length; i++){
    const TDS = deuxieme_tableau_trs[i].querySelectorAll("td");

    const DATE = new Date(TDS[2].innerHTML.split('/').reverse().join('-'));
    if(DATE > last_day){
      last_day = DATE;
    }

    const TYPE = TDS[0].innerHTML;
    const STATUT = TDS[3].innerHTML;
    const VALUE = parseFloat(TDS[4].innerHTML.replace(/,/g, '.'));

    if(TYPE.includes("RTT Salarié")){
      DoRTT(true, VALUE, STATUT, TDS);
    }
    else if(TYPE.includes("RTT Employeur")){
      DoRTT(false, VALUE, STATUT, TDS);
    }
    else if(TYPE.includes("Congés Payés")){
      DoCP(true, VALUE);

      if(STATUT.includes("Demande non encore validée ou pointée")){
        DoCP(false, VALUE);
      }

      TDS[4].classList.add(DONE_ATTRIBUTE);
    }
  }

  // S'il reste des lignes dans le deuxième tableau qui sont non traitées, on ajoute un message d'avertissement.
  if(deuxieme_tableau.querySelectorAll("tr > td:last-child:not(." + DONE_ATTRIBUTE + ")").length > 0){
    const ALERT = document.createElement("div");
    ALERT.classList.add("alert", "orange");
    ALERT.onclick = function() {
      ALERT.remove();
    }
    ALERT.innerHTML = "<u>/!\\</u> Certaines de vos absences (signalées avec des pastilles rouge) n'ont pas été traitées.<br/>Nous vous invitons à en informer le développeur afin qu'il puisse résoudre ce souci.<br/><a href='mailto:" + DEV_EMAIL +"'>" + DEV_EMAIL +"</a>";
    document.body.appendChild(ALERT);
  }
}

// Cette fonction retourne la valeur d'un cookie pour un nom donné.
function GetCookie(cookieName) {
  var name = cookieName + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if ((c.indexOf(name)) == 0) {
      return c.substr(name.length);
    }
  }
  return null;
}

// Cette fonction enregistre sous forme de cookies le nombre de jour estimé par l'utilisateur.
function SetFutur(_input){
  const NAME = _input.getAttribute("name");
  document.cookie = NAME + "=" + _input.value + ";";
  EstimateToDate();
}

function EstimateToDate(){
  const INPUT = document.getElementById(DATE_INPUT_ID);
  const DATE = new Date(INPUT.value);
  INPUT.classList.add("red");

  let current_date = new Date(document.getElementById("dateUpdateSolde").innerHTML.split('/').reverse().join('-'));
  let next_date = current_date;
  next_date.setMonth(next_date.getMonth() + 1);

  if(1 == 1 /* && DATE > last_day */ && DATE >= next_date){
    INPUT.classList.remove("red");

    console.log(next_date);
    while(current_date < DATE){
      for(let i = 1; i < premier_tableau_trs.length; i++){
        const TDS = premier_tableau_trs[i].querySelectorAll("td");
        let current_value = TDS[4].innerHTML.length > 0 ? parseFloat(TDS[4].innerHTML) : parseFloat(TDS[3].innerHTML);
        const TD_INPUT_VALUE = TDS[0].querySelector("input").value;
        const ADD = TD_INPUT_VALUE.length > 0 ? parseFloat(TDS[0].querySelector("input").value) : 0;
        TDS[4].innerHTML = current_value + ADD;
      }

      current_date.setMonth(current_date.getMonth() + 1);
      next_date.setMonth(next_date.getMonth() + 1);
    }
  }
}

// TODO :
// Ignorer les dates au dessus d'aujourd'hui.
// Pouvir prévoir dans le futur.
