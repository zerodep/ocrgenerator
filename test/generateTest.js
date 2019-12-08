import assert from 'assert';
import {soft, hard, fixed} from '../index';

const valids = [
  '18108401345678778',
  '18196701475307475',
  '1018966492531',
  '1019080881039',
  '03368912618',
  '1202951008',
  '1636976',
];

const fromString = [
  ['2019121', '201912193', '0000201912136', '201951'],
  ['2019-12-07200', '2019120720030', '0002019120720063'],
  ['2019-12-072002376', '20191207200237673', '020191207200237681'],
  ['Customer007:Date2019-12-24:Amount$200', '0072019122420063', '000000072019122420014'],
];

describe('generate', () => {
  describe('mjuk kontrollnivå', () => {
    // Företaget ska producera OCR-referensnummer med checksiffra.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // Det ska framgå av faktura eller motsvarande att OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Alla internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer, men accepterar ett annat referensbegrepp efter en varning, eftersom avtalet har mjuk kontrollnivå.
    valids.forEach((valid) => {
      it(`valid ${valid} adds length control digit and reference control digit`, () => {
        assert.equal(mjukkontroll(valid), true, 'soft control');

        const input = valid.substring(0, valid.length - 2);
        const result = soft(input);

        assert.equal(mjukkontroll(result), true, result);
        assert.equal(result, valid);
      });
    });

    fromString.forEach(([input, valid]) => {
      it(`from ${input} to ${valid} adds length control digit and reference control digit`, () => {
        const result = soft(input);
        assert.equal(result, valid);
        assert.equal(mjukkontroll(result), true, valid);
      });
    });
  });

  describe('hård kontrollnivå', () => {
    // Företaget ska producera OCR-referensnummer med checksiffra.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // Det ska framgå av faktura eller motsvarande att enbart OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer och accepterar bara referensnummer med korrekt checksiffra.
    // Betalningar med korrekt OCR-referensnummer redovisas enligt överenskommelse, normalt på fil.

    valids.forEach((valid) => {
      const input = valid.substring(0, valid.length - 2);

      it(`${input} -> ${valid} adds length control digit and reference control digit`, () => {
        const result = hard(input);
        assert.equal(result, valid);
        assert.equal(hardkontroll(result), true);
      });
    });

    fromString.forEach(([input, valid]) => {
      it(`from ${input} to ${valid} adds length control digit and reference control digit`, () => {
        const result = hard(input);
        assert.equal(hardkontroll(result), true, valid);
        assert.equal(result, valid);
      });
    });
  });

  describe('variabel kontroll av längdsiffra i OCR-referensnumret', () => {
    // Företaget ska producera OCR-referensnummer med både checksiffra och längdsiffra.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // Näst sista siffran är längdsiffran, d v s en entalssiffra som anger referensnumrets längd inklusive checksiffra.
    // Om referensnumret t ex är 24, 14 eller 4 tecken långt är den korrekta längdsiffran 4.
    // Det ska framgå av faktura eller motsvarande att enbart OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer och accepterar bara referensnummer med korrekt checksiffra och korrekt längdsiffra.
    // Betalningar med korrekt OCR-referensnummer redovisas enligt överenskommelse, normalt på fil.

    valids.forEach((result) => {
      it(`${result} adds length control digit and reference control digit`, () => {
        const input = result.substring(0, result.length - 2);
        assert.equal(hard(input), result, input);
        assert.equal(langdsiffra(result), true);
      });
    });

    fromString.forEach(([input, valid]) => {
      it(`from ${input} to ${valid} adds length control digit and reference control digit`, () => {
        const result = hard(input);
        assert.equal(langdsiffra(result), true, valid);
        assert.equal(result, valid);
      });
    });
  });

  describe('fast längdkontroll i OCR-referensnumret', () => {
    // Företaget ska producera OCR-referensnummer, med checksiffra, som består av det antal siffror som regleras i avtalet.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // OCR-referensnumrets antal tecken (längd) ska stämma med någon av de i avtalet valda längderna (max 2 olika antal tecken kan väljas).
    // De valda längderna noteras i avtalet med företagets bank och information om de valda längderna distribueras till alla internetbanker från Bankgirot.
    // Det ska framgå av faktura eller motsvarande att enbart OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer och accepterar bara referensnummer med korrekt checksiffra och en längd som stämmer med någon av de valda längderna i avtalet.
    // Betalningar med korrekt OCR-referensnummer redovisas enligt överenskommelse, normalt på fil.
    // Är du osäker på vilket avtal som gäller, kontakta din bank.
    valids.forEach((valid) => {
      it(`${valid} adds length control digit and reference control digit`, () => {
        const input = valid.substring(0, valid.length - 2);
        const result = fixed(input, valid.length);
        assert.equal(result, valid);
        assert.equal(result.length, valid.length, 'expected length');
        assert.equal(fastlangd(result, result.length, result.length), true);
      });
    });

    fromString.forEach(([input,, valid]) => {
      const length = valid.length;
      it(`from ${input} with fixed length ${length} pads with leading zeros to ${valid}`, () => {
        const result = fixed(input, length);
        assert.equal(result, valid);
        assert.equal(result.length, length, 'expected length');
        assert.equal(fastlangd(result, length, length), true, valid);
      });
    });

    it('input longer than fixed length is capped backwards', () => {
      const result = fixed('Customer007:Date2019-12-24:Amount$200', 13);
      const valid = '2019122420035';
      assert.equal(result, valid);
      assert.equal(result.length, 13, 'expected length');
      assert.equal(fastlangd(result, 13, 13), true, valid);
    });
  });
});


/* eslint-disable no-var,brace-style,eqeqeq,quotes */
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

function mjukkontroll(ocrnummer) {
  return modul(ocrnummer);
}

function hardkontroll(ocrnummer) {
  return modul(ocrnummer);
}

function langdsiffra(ocrnummer) {
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

  langdsvar = true; // validatelangdsiffror(ocrlangd1, ocrlangd2); //kör kollen så att de inskrivna längdsiffrorna är korrekta
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
  var ocrl1 = ocrlangd1;
  var ocrl2 = ocrlangd2;
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

