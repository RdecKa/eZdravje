
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  var ehrId = "";

  // TODO: Potrebno implementirati

  return ehrId;
}

var izbranaOsebaEHRZapis = null;

$(document).ready(function() {
    $('#izberiOsebo').change(function() {
        $('#sporociloZgoraj').text("");
        var podatki = $(this).val();
        if (podatki == "") {
            $('#izberiOseboDrugo').css("visibility", "visible");
            $('#izberiOseboDrugo').css("height", "auto");
            izbranaOsebaEHRZapis = null;
        } else if (podatki == "__prazno__") {
            izbranaOsebaEHRZapis = null;
            $('#izberiOseboDrugo').css("visibility", "hidden");
            $('#izberiOseboDrugo').css("height", "0");
        } else {
            izbranaOsebaEHRZapis = podatki;
            $('#izberiOseboDrugo').css("visibility", "hidden");
            $('#izberiOseboDrugo').css("height", "0");
        }
        //$("#izbranaOsebaEHR").val(podatki);
    });
});

function prikaziPodatke() {
    if (izbranaOsebaEHRZapis == null) {
        $('#sporociloZgoraj').text("Oseba ni izbrana!");
    }
}