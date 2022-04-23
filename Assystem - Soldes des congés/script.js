document.getElementById("logoEgencia").src = "https://www.assystem.com/wp-content/themes/assystem-corpo/dist/images/icons/logo-big.png";

const PREMIER_TABLEAU = document.querySelector("#SoldeCongePerso > table > tbody");
const PREMIER_TABLEAU_TRS = PREMIER_TABLEAU.querySelectorAll("tr");

const DEUXIEME_TABLEAU = document.querySelector("#SoldesAbsencesPerso > tbody");
let deuxieme_tableau_trs = DEUXIEME_TABLEAU.querySelectorAll("tr");

// Le deuxième tableau est rempli avec des données récupérées dans une requette AJAX, nous executons donc notre code après.
let interval = setInterval(function () {
  deuxieme_tableau_trs = DEUXIEME_TABLEAU.querySelectorAll("tr");
  if(deuxieme_tableau_trs.length > 1){
    launch();
    clearInterval(interval);
    return;
  }
}, 100);

function launch(){
  // Dans cette boucle, nous ajoutons une colonne vide intitulée "Moins absences" dans le premier tableau.
  for(let i = 0; i < PREMIER_TABLEAU_TRS.length; i++){
    let value = "";
    if(i > 0){
      value = parseFloat(PREMIER_TABLEAU_TRS[i].querySelectorAll("td")[1].innerHTML.replace(/,/g, '.'));
    }

    const FIRST_CONTAINER = document.createElement(i == 0 ? "th" : "td");
    if(i == 0){
      FIRST_CONTAINER.setAttribute("title", "Cette colonne contient les congés du dernier bulletin de paie, moins les absences validées ou pointées.");
    }
    FIRST_CONTAINER.appendChild(document.createTextNode(i == 0 ? "Validés ou pointés (?)" : value));
    PREMIER_TABLEAU_TRS[i].appendChild(FIRST_CONTAINER);

    const SECOND_CONTAINER = document.createElement(i == 0 ? "th" : "td");
    if(i == 0){
      SECOND_CONTAINER.setAttribute("title", "Cette colonne contient les congés du dernier bulletin de paie, moins les absences validées ou pointées et non encore validées ou pointées.");
    }
    SECOND_CONTAINER.appendChild(document.createTextNode(i == 0 ? "Non encore validés ou pointés (?)" : value));
    PREMIER_TABLEAU_TRS[i].appendChild(SECOND_CONTAINER);
  }

  // Cette fonction répercute les jours "RTT" du deuxième tableau au premier.
  function DoRTT(_salaryMode, _value, _statut, _tds){
    const TD1 = PREMIER_TABLEAU_TRS[_salaryMode ? 8 : 7].querySelectorAll("td")[3];
    SetTDValue(TD1, (TD1.innerHTML - _value));

    if(_statut.includes("Demande non encore validée ou pointée")){
      const TD2 = PREMIER_TABLEAU_TRS[_salaryMode ? 8 : 7].querySelectorAll("td")[2];
      SetTDValue(TD2, (TD2.innerHTML - _value));
    }

    _tds[4].classList.add("done");
  }

  // Cette fonction répercute les jours "Congés payés" du deuxième tableau au premier.
  function DoCP(_statutValideOuPointe, _value){
    const TD1 = PREMIER_TABLEAU_TRS[3].querySelectorAll("td")[_statutValideOuPointe ? 3 : 2];
    let value1 = parseFloat((TD1.innerHTML));
    if(value1 - _value < 0){
      const VALUE1bis = value1 - _value;
      value1 = 0;

      const TD1bis = PREMIER_TABLEAU_TRS[2].querySelectorAll("td")[_statutValideOuPointe ? 3 : 2];
      const TD1bisValue = parseFloat(TD1bis.innerHTML);
      SetTDValue(TD1bis, (TD1bisValue + VALUE1bis));
    }
    SetTDValue(TD1, value1);
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

  for(let i = 1; i < deuxieme_tableau_trs.length; i++){
    const TDS = deuxieme_tableau_trs[i].querySelectorAll("td");

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

      TDS[4].classList.add("done");
    }
  }
}
