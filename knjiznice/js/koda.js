
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
        vpisiPodatke(ehrId, "2016-05-01T09:08", "173.4", "51", "36.7", "118", "83", "97");
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
        //$("#izbranaOsebaEHR").val(podatki);
    });
});

function prikaziPodatke() {
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
        console.log("Uspešno:", izbranaOseba);
    }
    $.ajax({
		url: baseUrl + "/demographics/ehr/" + izbranaOseba + "/party",
        type: 'GET',
		headers: {"Ehr-Session": sessionId},
		success: function(data) {
		    //bmi(izbranaOseba);
            console.log("Uspešno");
            var party = data.party;
            console.log(party.firstNames + " " + party.lastNames);
            var visine = [], teze = [];
            var niPodatkov = false;
            $.ajax({
				url: baseUrl + "/view/" + izbranaOseba + "/height",
				type: 'GET',
				headers: {"Ehr-Session": sessionId},
				success: function (res) {
				    if (res.length > 0) {
				        for (var i in res) {
				            visine[res[i].time] = res[i].height;
				        }
				        
				        $.ajax({
            				url: baseUrl + "/view/" + izbranaOseba + "/weight",
            				type: 'GET',
            				headers: {"Ehr-Session": sessionId},
            				success: function (res) {
            				    if (res.length > 0) {
            				        for (var i in res) {
            				            teze[res[i].time] = res[i].weight;
            				        }
            				        izrisiGrafITM(itm(teze, visine));
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
    console.log(visine);
    console.log(teze);
    var bmi = [];
    for (var i in teze) {
        var m = teze[i];
        var h = visine[i];
        bmi.push(m / (h * h / 10000));
    }
    return bmi;
}

function izrisiGrafITM(itm) {
    console.log(itm);
}