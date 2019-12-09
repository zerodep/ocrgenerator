/* eslint-disable no-var,brace-style,eqeqeq,quotes,no-unused-vars */

/*
Snippet from:
https://www.bankgirot.se/Frontend/build/javascripts/app.js
*/

export {
  fastlangd,
  hardkontroll,
  langdsiffra,
  mjukkontroll,
};

function mjukkontroll(ocrnummer) {
  if (!validateallfields(undefined, undefined, undefined, ocrnummer)) return false;

  return modul(ocrnummer);
}

function hardkontroll(ocrnummer) {
  if (!validateallfields(undefined, undefined, undefined, ocrnummer)) return false;

  return modul(ocrnummer);
}

function modul(ocrnummer) {
  var res1 = 0;
  var res = 0; //resultatet av sammanräkningen
  var ksiffra1 = 0;
  var ksiffra = 0;
  var asiffra = 0; //från OCR-numret aktuell siffra
  var l = ocrnummer.length; //antal siffror i ocrnummer-fältet
  var bsiffra = 0; // kontrollsiffran
  var ocrstring = ocrnummer; // gör värdet i ocrnummer-fältet till en sträng
  var b = 0;
  var ocrl = l - 1; // för att inte räkna med sista siffran i 10-moduls-beräkningen
  var resm2 = 0; // andra siffran vid tal större än 9
  bsiffra = ocrstring.substr(ocrl, 1); // kontrollsiffran direkt tagen ur OCR-strängen
  var raknestart = l - 2; // ger positionen där vi ska börja räkna (från höger)
  var raknare = 0; // för att hålla reda på vilket varv vi är på

  for (var a = raknestart; a != -1; a--) //loop som går igenom ocrsträngen förutom checksiffran
  {
    asiffra = ocrstring.substr(a, 1); //asiffra får värdet av den aktuella siffran

    if (raknare % 2 == 0) // om aktuell siffras position är jämn (utifrån att vi börjar på 0)
    {
      res1 = 0;
      res1 = 2 * asiffra;
      if (res1 > 9) // om beräkningen blir 10 eller mer
      {
        resm2 = res1 - 10; // räknar ut den andra siffran
        res = res + 1 + resm2; // adderar siffrorna
      } else // om beräkningen blir mindre än 10
      {
        res = res + res1;
      }
    } else // om aktuell siffras position är ojämn (utifrån att vi börjar på 0)
    {
      //  udda varv
      res1 = 0;
      res1 = 1 * asiffra;
      res = res + res1;
    }
    raknare = raknare + 1;
  }
  ksiffra1 = res % 10; // tar bort tio-tals-siffran från res-variablen
  if (ksiffra1 == 0) {
    ksiffra = 0; //kontrollsiffran blir en nolla
  } else {
    ksiffra = 10 - ksiffra1; // räknar ut kontroll-siffran
  }
  asiffra = 0;

  if (ksiffra == bsiffra) {
    return true;
  } else {
    return false;
  }
}

function langdsiffra(ocrnummer) {
  if (!validateallfields(undefined, undefined, undefined, ocrnummer)) return false;

  var l = ocrnummer.length; //antal siffror i ocrnummer-fältet
  var langd;

  if (l > 9) {
    langd = l % 10; //modulus
  } else {
    langd = l;
  }
  var ocrstring = ocrnummer; // gör värdet i ocrnummer-fältet till en sträng
  var lpos = l - 2; // -2 eftersom den börjar på 0
  var ls = ocrstring.substr(lpos, 1);
  var lsiffra = parseInt(ls);
  var svar;
  svar = modul(ocrnummer);
  if (svar) {
    if (lsiffra == langd) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function fastlangd(ocrnummer, ocrlangd1, ocrlangd2) {
  if (!validateallfields(undefined, ocrlangd1, ocrlangd2, ocrnummer)) return false;

  var l = ocrnummer.length; //antal siffror i ocrnummer-fältet
  var langd;
  if (l > 9) {
    langd = l % 10; //modulus
  } else {
    langd = l;
  }
  var ocrstring = ocrnummer; // gör värdet i ocrnummer-fältet till en sträng
  var ls1 = ocrlangd1;
  var lsiffra1 = parseInt(ls1);
  var ls2 = ocrlangd2;
  var lsiffra2 = parseInt(ls2);
  var langdsvar;


  langdsvar = validatelangdsiffror(ocrlangd1.toString(), ocrlangd2 && ocrlangd2.toString()); //kör kollen så att de inskrivna längdsiffrorna är korrekta
  if (langdsvar) // kollar så längden är korrekt
  {
    var svar;
    svar = modul(ocrnummer); // kör tio-modulen på ocrnumret
    if (svar) // om tio-.modulen gick bra
    {
      if (lsiffra1 == l) // kollar om ocrnumret's längd motsvarar den i ocrlangd1 angivna
      {
        return true;
      } else {
        if (lsiffra2 == l) {
          return true;
        } else {
          return false;
        }
      }
      // slut på kontrollen mot längdsiffrorna (lsiffra==
    } else // om tio-modulen inte gick bra
    {
      return false;
    }
    // slut på tio-modul-snurran
  } else //om langdsiffrorna inte var korrekta
  {
    //alert("Längdsiffrorna är inte korrekta")
    return false;
  }
}

function validatelangdsiffror(ocrlangd1, ocrlangd2) {
  ocrlangd2 = ocrlangd2 || ocrlangd1;
  var ocrl1 = ocrlangd1.length;
  var ocrl2 = ocrlangd2.length;
  var f = 0;

  if (ocrl1 != 0) {
    for (var lsiffra1 = 0; lsiffra1 < ocrl1; lsiffra1++) //kollar om lÃ¤ngdsiffra1 Ã¤r annat Ã¤n siffror
    {
      if (f == 0 & (ocrlangd1.substring(lsiffra1, lsiffra1 + 1) < '0' || ocrlangd1.substring(lsiffra1, lsiffra1 + 1) > '9')) {
        f = f + 1;
      }
    }
    if (ocrlangd1 < 2) //kollar om ocrlangd1's vÃ¤rde Ã¤r mindre Ã¤n 2
    {
      f = f + 1;
    }

    if (ocrlangd1 > 25) //kollar om ocrlangd1's vÃ¤rde Ã¤r mer Ã¤n 25
    {
      f = f + 1;
    }
  }

  if (ocrl2 != 0) {
    for (var lsiffra2 = 0; lsiffra2 < ocrl2; lsiffra2++) //kollar om lÃ¤ngdsiffra1 Ã¤r annat Ã¤n siffror
    {
      if (f == 0 & (ocrlangd2.substring(lsiffra2, lsiffra2 + 1) < '0' || ocrlangd2.substring(lsiffra2, lsiffra2 + 1) > '9')) {
        f = f + 1;
      }
    }

    if (ocrlangd2 < 2) //kollar om ocrlangd1's vÃ¤rde Ã¤r mindre Ã¤n 2
    {
      f = f + 1;
    }

    if (ocrlangd2 > 25) //kollar om ocrlangd1's vÃ¤rde Ã¤r mer Ã¤n 25
    {
      f = f + 1;
    }
  }

  if (f == 0) {
    return true;
  } else {
    return false;
  }
}

function validateallfields(ocravtal, ocrlangd1, ocrlangd2, ocrnummer) {

  var f = 0; //rÃ¤knare fÃ¶r att hÃ¥lla reda pÃ¥ om det Ã¤r fel eller inte - Ã¤r 0 om inte fel
  var kost;
  kost = ocrnummer.length;

  //alert ("Validering av fÃ¤lten")
  // if (ocravtal[0].checked == false & ocravtal[1].checked == false & ocravtal[2].checked == false & ocravtal[3].checked == false) {
  //   f = f + 1;
  // }

  if (ocrnummer == "") {
    f = f + 1;
  }

  var b = 0;
  for (var l = 0; l < kost; l++) //kollar om ocrnumret Ã¤r annat Ã¤n siffror
  {
    if (f == 0 & (ocrnummer.substring(l, l + 1) < '0' || ocrnummer.substring(l, l + 1) > '9')) {
      f = f + 1;
      if (b < 1) {
        b = b + 1;
      }
    }
  }

  if (kost < 2) //kollar om ocr-numret Ã¤r mindre Ã¤n tvÃ¥ tecken
  {
    f = f + 1;
  }

  if (kost > 25) {
    f = f + 1;
  }

  if (f == 0) {
    return true;
  } else {
    return false;
  }
}
