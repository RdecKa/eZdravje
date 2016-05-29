
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
    sessionId = getSessionId();
    var ime = "";
    var priimek = "";
    var datumRojstva = "";
    if (stPacienta == 1) {
        ime = "Alenka";
        priimek = "Pustovrh";
        datumRojstva = "1996-07-01T15:17";
    } else if (stPacienta == 2) {
        ime = "Jakob";
        priimek = "Jezeršek";
        datumRojstva = "1985-01-26T01:37";
    } else {
        ime = "Mojca";
        priimek = "Kržišnik";
        datumRojstva = "1957-12-24T22:12";
    }
  
    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId}
    });
    $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            ehrId = data.ehrId;
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: datumRojstva,
                partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    console.log("Uspešno kreiran EHR: " + ehrId);
                    var opt = document.createElement("option");
                    opt.value = ehrId;
                    opt.text = ime + " " + priimek;
                    document.getElementById("izberiOsebo").add(opt);
                    if (stPacienta == 3) {
                        var opt = document.createElement("option");
                        opt.value = "";
                        opt.text = "... drugo ...";
                        document.getElementById("izberiOsebo").add(opt);
                    }
                    generirajMeritve(stPacienta, ehrId);
                    return ehrId;
                },
                error: function(err) {
                    console.log("Napaka");
                    return null;
                }
            });
        }
    });
}

function generirajMeritve(stPacienta, ehrId) {
    if (stPacienta == 1) {
        vpisiPodatke(ehrId, "2016-01-01T09:08", "173.3", "49", "36.7", "118", "80", "97");
        vpisiPodatke(ehrId, "2016-02-01T09:08", "173.4", "52", "36.9", "121", "78", "98");
        vpisiPodatke(ehrId, "2016-03-01T09:08", "173.4", "51", "37.1", "123", "78", "98");
        vpisiPodatke(ehrId, "2016-04-01T09:08", "173.3", "53", "36.6", "119", "81", "98");
        //vpisiPodatke(ehrId, "2016-05-01T09:08", "173.4", "51", "36.7", "118", "83", "97");
    } else if (stPacienta == 2) {
        vpisiPodatke(ehrId, "2015-12-15T09:08", "184.4", "86", "37.7", "148", "90", "98");
        vpisiPodatke(ehrId, "2016-01-03T09:08", "184.4", "87", "36.5", "141", "98", "98");
        vpisiPodatke(ehrId, "2016-02-27T09:08", "184.2", "89", "37.3", "143", "98", "99");
        vpisiPodatke(ehrId, "2016-04-15T09:08", "184.5", "87", "37.1", "149", "91", "98");
        vpisiPodatke(ehrId, "2016-05-29T09:08", "184.4", "86", "36.8", "148", "93", "97");
    } else {
        vpisiPodatke(ehrId, "2015-11-08T09:08", "170.2", "107", "36.7", "130", "90", "97");
        vpisiPodatke(ehrId, "2015-12-14T09:08", "170.4", "108", "37.5", "131", "88", "98");
        vpisiPodatke(ehrId, "2016-01-16T09:08", "170.5", "109", "36.3", "133", "88", "97");
        vpisiPodatke(ehrId, "2016-03-24T09:08", "170.4", "110", "36.8", "140", "93", "96");
        vpisiPodatke(ehrId, "2016-05-20T09:08", "170.2", "111", "36.5", "137", "93", "97");
    }
}

function vpisiPodatke(ehrId, datum, visina, teza, temperatura, sistolicni, diastolicni, nasicenost) {
    sessionId = getSessionId();
    $.ajaxSetup({
		headers: {"Ehr-Session": sessionId}
    });
	var podatki = {
		"ctx/language": "en",
		"ctx/territory": "SI",
		"ctx/time": datum,
		"vital_signs/height_length/any_event/body_height_length": visina,
		"vital_signs/body_weight/any_event/body_weight": teza,
		"vital_signs/body_temperature/any_event/temperature|magnitude": temperatura,
		"vital_signs/body_temperature/any_event/temperature|unit": "°C",
		"vital_signs/blood_pressure/any_event/systolic": sistolicni,
		"vital_signs/blood_pressure/any_event/diastolic": diastolicni,
		"vital_signs/indirect_oximetry:0/spo2|numerator": nasicenost
	};
	var parametriZahteve = {
		ehrId: ehrId,
		templateId: 'Vital Signs',
		format: 'FLAT'
	};
	$.ajax({
		url: baseUrl + "/composition?" + $.param(parametriZahteve),
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(podatki),
		success: function (res) {
            console.log("Podatki za " + ehrId + " vpisani");
		},
		error: function(err) {
            console.log("Prišlo je do napake pri vpisovanju podatkov");
		}
	});
}

var izbranaOsebaEHRZapis = null;
var izbranaOsebaVpisanEHRZapis = null;
var sessionId;

$(document).ready(function() {
    $('#vsebina').css("visibility", "hidden");
    for (var i = 1; i <= 3; i++) {
        generirajPodatke(i);
    }
    $('#izberiOsebo').change(function() {
        $('#sporociloZgoraj').text("");
        $('#sporociloSpodaj').text("");
        
        var podatki = $(this).val();
        if (podatki == "") {
            izbranaOsebaEHRZapis = null;
            $('#izberiOseboDrugo').css("visibility", "visible");
            $('#izberiOseboDrugo').css("height", "auto");
            $('#izbranaOsebaEHR').val("");
            $('#izbranaOsebaEHR').focus();
        } else if (podatki == "__prazno__") {
            izbranaOsebaEHRZapis = null;
            $('#izberiOseboDrugo').css("visibility", "hidden");
            $('#izberiOseboDrugo').css("height", "0");
            $('#izbranaOsebaEHR').val("");
        } else {
            izbranaOsebaEHRZapis = podatki;
            $('#izberiOseboDrugo').css("visibility", "hidden");
            $('#izberiOseboDrugo').css("height", "0");
        }
        pobrisiStarePodatke();
    });
});

function pobrisiStarePodatke() {
    //$('#sporociloLevo').text("");
    $('#sporociloDesno').text("");
    $('#podatkiDesno').text("");
    pobrisiGraf();
    $('#vsebina').css("visibility", "hidden");
}

var visine, teze;
function prikaziPodatke() {
    pobrisiStarePodatke();
    visine = [], teze = [];
    sessionId = getSessionId();
    var izbranaOseba;
    izbranaOsebaVpisanEHRZapis = $('#izbranaOsebaEHR').val();
    if (izbranaOsebaEHRZapis == null && izbranaOsebaVpisanEHRZapis == "") {
        $('#sporociloZgoraj').text("Oseba ni izbrana!");
        return;
    } else {
        $('#sporociloZgoraj').text("");
        if (izbranaOsebaEHRZapis == null) {
            izbranaOseba = izbranaOsebaVpisanEHRZapis;
        } else {
            izbranaOseba = izbranaOsebaEHRZapis;
        }
    }
    $('#vsebina').css("visibility", "visible");
    $.ajax({
		url: baseUrl + "/demographics/ehr/" + izbranaOseba + "/party",
        type: 'GET',
		headers: {"Ehr-Session": sessionId},
		success: function(data) {
            var party = data.party;
            console.log(party.firstNames + " " + party.lastNames);
            
            $.ajax({
				url: baseUrl + "/view/" + izbranaOseba + "/height",
				type: 'GET',
				headers: {"Ehr-Session": sessionId},
				success: function (res) {
				    if (res.length > 0) {
				        for (var i in res) {
				            visine[res[i].time] = res[i].height;
				        }
				        var zadnjaVisina = res[res.length - 1].height;
				        
				        $.ajax({
            				url: baseUrl + "/view/" + izbranaOseba + "/weight",
            				type: 'GET',
            				headers: {"Ehr-Session": sessionId},
            				success: function (res) {
            				    if (res.length > 0) {
            				        for (var i in res) {
            				            teze[res[i].time] = res[i].weight;
            				        }
            				        var zadnjaTeza = res[res.length - 1].weight;
            				        izrisiGrafITM(itm(teze, visine));
            				        analizirajZadnjiZapis(zadnjaVisina, zadnjaTeza);
            				    } else {
            				        $('#sporociloSpodaj').text("O tej osebi ne obstaja noben zapis.");
            				    }
            				},
            				error: function (res) {
            				    console.log("Buuu");
            				}
                        });
				    } else {
				        $('#sporociloSpodaj').text("O tej osebi ne obstaja noben zapis.");
				    }
				},
				error: function (res) {
				    console.log("Buuu");
				}
            });
		},
		error: function(err) {
		    console.log("Ups");
		}
    });
}

function itm(teze, visine) {
    var bmi = [];
    for (var i in teze) {
        var t = {
            datum: i.substring(0, 10),
            itm: (teze[i] / (visine[i] * visine[i] / 10000))
        };
        bmi.push(t);
    }
    bmi = urediPoDatumuNarascajoce(bmi);
    return bmi;
}

function urediPoDatumuNarascajoce(bmi) {
    var novBMI = [];
    for (var i = bmi.length - 1; i >= 0; i--) {
        novBMI.push(bmi[i]);
    }
    console.log(novBMI);
    return novBMI;
}

function analizirajZadnjiZapis(visina, teza) {
    var itm = teza / (visina * visina / 10000);
    var min = Math.round(optimalnaTezaMin(visina));
    var max = Math.round(optimalnaTezaMax(visina));
    var rezultat = "Rezultati zadnje meritve kažejo, da je vaša teža ";
    if (itm < 18.5) {
        rezultat += "prenizka.";
    } else if (itm < 25) {
        rezultat += "ravno pravšnja.";
    } else if (itm < 30) {
        rezultat += "prevelika.";
    } else {
        rezultat += "močno prevelika.";
    }
    if (itm < 18.5 || itm > 24.9) {
        rezultat += " Vaša opimalna teža je med " + min + "kg in " + max + "kg.";
    }
    $('#podatkiDesno').html('<span class="krepko">Višina: </span><span>' + visina + 'm</span></br>' +
        '<span class="krepko">Teža: </span><span>' + teza + 'kg</span></br>' + 
        '<span class="krepko">ITM: </span>' + Math.round(itm * 10)/10);
    $('#sporociloDesno').text(rezultat);
}

function optimalnaTezaMin(visina) {
    var min = 18.5 * visina * visina / 10000;
    return min;
}

function optimalnaTezaMax(visina) {
    var max = 24.9 * visina * visina / 10000;
    return max;
}

function vrniDatum(string) {
    var data = string.split("-");
    var leto = parseInt(data[0]);
    var mesec = parseInt(data[1]) - 1;
    var dan = parseInt(data[2]);
    var d = new Date(leto, mesec, dan);
    return d;
}

function izrisiNovGraf() {
    pobrisiGraf();
    var start = vrniDatum($('#obdobjePrikazaZacetek').val());
    var stop = vrniDatum($('#obdobjePrikazaKonec').val());
    if (stop < start) {
        $('#sporociloLevo').text("Neveljaven termin!");
    } else {
        var bmi = []
        for (var i in visine) {
            var d = vrniDatum(i);
            if (d >= start && d <= stop) {
                var t = {
                    datum: i.substring(0, 10),
                    itm: (teze[i] / (visine[i] * visine[i] / 10000))
                };
                bmi.push(t);
            }
        }
        bmi = urediPoDatumuNarascajoce(bmi);
        izrisiGrafITM(bmi);
    }
}