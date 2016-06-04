
var baseUrl = 'https://rest.ehrscape.com/rest/v1';

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

var izbranaOsebaEHRZapis = null;
var izbranaOsebaVpisanEHRZapis = null;
var sessionId;

$(document).ready(function() {
    $('#vsebina').css("visibility", "hidden");
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
    $('#sporociloLevo').text("");
    $('#sporociloDesno').text("");
    $('#podatkiDesno').text("");
    pobrisiGraf();
    $('#vsebina').css("visibility", "hidden");
    $('#obdobjePrikazaZacetek').val("");
    $('#obdobjePrikazaKonec').val("");
    $('#izpisEHRID').text("");
    $('#twitter').html("");
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
        if (izbranaOsebaEHRZapis == null) {
            izbranaOseba = izbranaOsebaVpisanEHRZapis;
        } else {
            izbranaOseba = izbranaOsebaEHRZapis;
            $('#izpisEHRID').text("EhrID: " + izbranaOseba);
        }
    }
    
    $.ajax({
		url: baseUrl + "/demographics/ehr/" + izbranaOseba + "/party",
        type: 'GET',
		headers: {"Ehr-Session": sessionId},
		success: function(data) {
            var party = data.party;
            $('#vsebina').css("visibility", "visible");
            $.ajax({
				url: baseUrl + "/view/" + izbranaOseba + "/height",
				type: 'GET',
				headers: {"Ehr-Session": sessionId},
				success: function (res) {
				    if (res.length > 0) {
				        for (var i in res) {
				            visine[res[i].time] = res[i].height;
				        }
				        var zadnjaVisina = res[0].height;
				        
				        $.ajax({
            				url: baseUrl + "/view/" + izbranaOseba + "/weight",
            				type: 'GET',
            				headers: {"Ehr-Session": sessionId},
            				success: function (res) {
            				    if (res.length > 0) {
            				        for (var i in res) {
            				            teze[res[i].time] = res[i].weight;
            				        }
            				        var zadnjaTeza = res[0].weight;
            				        var rez = itm(teze, visine);
            				        izrisiGrafITM(rez);
            				        analizirajZadnjiZapis(zadnjaVisina, zadnjaTeza);
            				    } else {
            				        pobrisiStarePodatke();
            				        $('#sporociloZgoraj').text("O tej osebi ne obstaja noben zapis.");
            				    }
            				},
            				error: function (err) {
            				    $('#sporociloZgoraj').html("Prišlo je do napake: " + JSON.parse(err.responseText).userMessage);
            				}
                        });
				    } else {
				        pobrisiStarePodatke();
				        $('#sporociloZgoraj').text("O tej osebi ne obstaja noben zapis.");
				    }
				},
				error: function (err) {
				    $('#sporociloZgoraj').html("Prišlo je do napake: " + JSON.parse(err.responseText).userMessage);
				}
            });
		},
		error: function(err) {
		    $('#sporociloZgoraj').text("Vnešen EHR zapis ne pripada nobeni osebi.");
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
    return novBMI;
}

function analizirajZadnjiZapis(visina, teza) {
    var itm = teza / (visina * visina / 10000);
    var min = Math.round(optimalnaTezaMin(visina));
    var max = Math.round(optimalnaTezaMax(visina));
    var rezultat = "Rezultati zadnje meritve kažejo, da je vaša teža ";
    if (itm < 18.5) {
        rezultat += "<b>prenizka</b>.";
    } else if (itm < 25) {
        rezultat += "<b>ravno pravšnja</b>.";
    } else if (itm < 30) {
        rezultat += "<b>prevelika</b>.";
    } else {
        rezultat += "<b>močno prevelika</b>.";
    }
    if (itm < 18.5 || itm > 24.9) {
        rezultat += " Vaša opimalna teža je med " + min + "kg in " + max + "kg.<br/><br/>Morda vam pri uravnavanju telesne teže pomaga katera izmed spodnjih objav:";
        if (itm < 18.5) {
            $('#twitter').html('<a class="twitter-timeline"  href="https://twitter.com/hashtag/gainweight" data-widget-id="737609731099889665">#gainweight Tweets</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?"http":"https";js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}(document,"script","twitter-wjs");</script>');
        } else {
            $('#twitter').html('<a class="twitter-timeline"  href="https://twitter.com/hashtag/loseweight" data-widget-id="737608275399565316">#loseweight Tweets</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?"http":"https";js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}(document,"script","twitter-wjs");</script>')
        }
        
    }
    $('#podatkiDesno').html('<span class="krepko">Višina: </span><span>' + visina + 'cm</span></br>' +
        '<span class="krepko">Teža: </span><span>' + teza + 'kg</span></br>' + 
        '<span class="krepko">ITM: </span>' + Math.round(itm * 10)/10);
    $('#sporociloDesno').html(rezultat);
}

function optimalnaTezaMin(visina) {
    var min = 18.5 * visina * visina / 10000;
    return min;
}

function optimalnaTezaMax(visina) {
    var max = 24.9 * visina * visina / 10000;
    return max;
}

function vrniDatum(datum) {
    var data = datum.split("-");
    var leto = parseInt(data[0]);
    var mesec = parseInt(data[1]) - 1;
    var dan = parseInt(data[2]);
    var d = new Date(leto, mesec, dan);
    return d;
}

function izrisiNovGraf() {
    pobrisiGraf();
    $('#sporociloLevo').text("");
    var start = $('#obdobjePrikazaZacetek').val();
    var stop = $('#obdobjePrikazaKonec').val();
    if (start == "") {
        start = "1500-01-01";
    }
    start = vrniDatum(start);
    if (stop == "") {
        stop = new Date();
    } else {
        stop = vrniDatum(stop);
    }
    if (stop < start) {
        $('#sporociloLevo').text("Neveljaven termin!");
    } else {
        var bmi = [];
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