/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
 
var rezultat = "";
function generirajPodatke(stPacienta) {
    pobrisiStarePodatke();
    var ehrId = "";
    sessionId = getSessionId();
    var ime = "";
    var priimek = "";
    var datumRojstva = "";
    if (stPacienta == 1) {
        ime = "Alenka";
        priimek = "Pustovrh";
        datumRojstva = "1996-07-01T15:17";
        rezultat = "<option value='__prazno__'></option>";
    } else if (stPacienta == 2) {
        ime = "Jakob";
        priimek = "Jezeršek";
        datumRojstva = "1985-01-26T01:37";
    } else if (stPacienta == 3) {
        ime = "Mojca";
        priimek = "Kržišnik";
        datumRojstva = "1957-12-24T22:12";
    } else {
        return;
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
                    console.log("Uspešno kreiran EHR (" + ime + " " + priimek + "): " + ehrId);
                    rezultat += "<option value='" + ehrId + "'>" + ime + " " + priimek + "</option>";
                    if (stPacienta == 3) {
                        rezultat += "<option value=''>... drugo ...</option>";
                    }
                    $('#izberiOsebo').html(rezultat);
                    generirajMeritve(stPacienta, ehrId);
                    return ehrId;
                },
                error: function(err) {
                    //console.log("Napaka");
                    $('#sporociloZgoraj').html("Prišlo je do napake: " + JSON.parse(err.responseText).userMessage);
                    return null;
                }
            });
        }
    });
}

function generirajMeritve(stPacienta, ehrId) {
    if (stPacienta == 1) {
        vpisiPodatke(ehrId, "2015-10-01T09:08", "173.5", "58", "36.7", "118", "83", "98");
        vpisiPodatke(ehrId, "2015-11-01T09:08", "173.4", "58", "36.5", "119", "80", "98");
        vpisiPodatke(ehrId, "2015-12-01T09:08", "173.4", "56", "36.7", "118", "83", "97");
        vpisiPodatke(ehrId, "2016-01-01T09:08", "173.3", "55", "36.7", "118", "80", "97");
        vpisiPodatke(ehrId, "2016-02-01T09:08", "173.4", "57", "36.9", "121", "78", "98");
        vpisiPodatke(ehrId, "2016-03-01T09:08", "173.4", "56", "37.1", "123", "78", "98");
        vpisiPodatke(ehrId, "2016-04-01T09:08", "173.3", "54", "36.6", "119", "81", "98");
        vpisiPodatke(ehrId, "2016-05-01T09:08", "173.4", "52", "36.7", "118", "83", "97");
        vpisiPodatke(ehrId, "2016-06-01T09:08", "173.4", "51", "36.3", "119", "82", "97");
    } else if (stPacienta == 2) {
        vpisiPodatke(ehrId, "2015-09-15T09:08", "184.4", "85", "36.7", "147", "90", "99");
        vpisiPodatke(ehrId, "2015-10-15T09:08", "184.4", "87", "36.7", "148", "88", "98");
        vpisiPodatke(ehrId, "2015-11-15T09:08", "184.6", "89", "37.2", "148", "90", "98");
        vpisiPodatke(ehrId, "2015-12-15T09:08", "184.4", "88", "37.7", "148", "90", "98");
        vpisiPodatke(ehrId, "2016-01-03T09:08", "184.4", "87", "36.5", "141", "98", "98");
        vpisiPodatke(ehrId, "2016-02-27T09:08", "184.2", "85", "37.3", "143", "98", "99");
        vpisiPodatke(ehrId, "2016-04-15T09:08", "184.5", "83", "37.1", "149", "91", "98");
        vpisiPodatke(ehrId, "2016-05-29T09:08", "184.4", "81", "36.8", "148", "93", "97");
        vpisiPodatke(ehrId, "2016-06-04T09:08", "184.4", "81", "36.9", "147", "93", "97");
    } else if (stPacienta == 3) {
        vpisiPodatke(ehrId, "2015-06-08T09:08", "170.2", "103", "36.8", "130", "90", "97");
        vpisiPodatke(ehrId, "2015-07-08T09:08", "170.1", "104", "36.7", "132", "93", "97");
        vpisiPodatke(ehrId, "2015-09-08T09:08", "170.4", "105", "36.6", "130", "94", "97");
        vpisiPodatke(ehrId, "2015-10-08T09:08", "170.2", "106", "36.7", "132", "90", "98");
        vpisiPodatke(ehrId, "2015-11-08T09:08", "170.2", "107", "36.7", "130", "90", "97");
        vpisiPodatke(ehrId, "2015-12-14T09:08", "170.4", "108", "37.5", "131", "88", "98");
        vpisiPodatke(ehrId, "2016-01-16T09:08", "170.5", "109", "36.3", "133", "88", "97");
        vpisiPodatke(ehrId, "2016-03-24T09:08", "170.4", "110", "36.8", "140", "93", "96");
        vpisiPodatke(ehrId, "2016-05-20T09:08", "170.2", "111", "36.5", "137", "93", "97");
        alert("Generiranje podatkov končano.");
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
            //console.log("Podatki za " + ehrId + " vpisani");
		},
		error: function(err) {
            $('#sporociloZgoraj').html("Prišlo je do napake pri vpisovanju podatkov: " + JSON.parse(err.responseText).userMessage);
		}
	});
}
