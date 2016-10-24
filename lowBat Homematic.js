//original http://www.iobroker.net/?page_id=2936&lang=de
//Hinweis jedem Homatic Batterie Geräte in der Zeile LOWBAT den Namen setzen !
//Änderungen Chris:
//  moeglicheLOWBAT Counter wird nun hochgezählt
//  Ignorieren von LOWBAT null Geräten wie z.B. Zwischensteckdose HM-LC-Sw1-Pl-DN-R1 
//  Text setzen, keine Geräte Batterie leer
createState('zählenLowbat.möglicheLOWBAT', 0);   // wenn benötigt: Anzahl der vorhandenen LOWBAT
createState('zählenLowbat.anzahlLOWBAT', 0);     // wenn benötigt: Anzahl der vorhandenen LOWBAT
createState('zählenLowbat.textLOWBAT', " ");     // Anzahl LOWBAT, die an sind als Variable unter Javascript.0 anlegen

var cacheSelectorLOWBAT  = $('channel[state.id=*.LOWBAT]');

function countLowbat(obj) {
   // Setzt die Zähler vor dem Durchlauf aller Elemente *.LOWBAT auf 0
   var moeglicheLOWBAT = 0;
   var anzahlLOWBAT    = 0;
   var textLOWBAT      = [];

   if (obj) {
      log('Auslösender Aktor: ' + obj.id + ': ' + obj.newState.val);  // Info im Log, welcher Zustand sich geändert hat
   } else {
      log('Ausgelöst bei Timer'); 
   } 

   cacheSelectorLOWBAT.each(function (id, i) {                         // Schleife für jedes gefundenen Element *.LOWBAT
      var status = getState(id).val;                                  // Zustand *.LOWBAT abfragen (jedes Element)
      var obj    = getObject(id);
      if (status === true) {                                          // wenn Zustand = true, dann wird die Anzahl der Geräte hochgezählt
         textLOWBAT.push(obj.common.name);                           // Zu Array hinzufügen
          ++anzahlLOWBAT;   // added counter
      }                
      log("Geräte Nr. " + i + ": " + getObject(id).common.name + ": " + status);
      // Zählt die Anzahl der vorhandenen Geräte unabhängig vom Status, sttus=null Geräte ignorieren 
      if (status === true || status === false) {
      ++moeglicheLOWBAT;        //changed 
      }
     
      
   }); 
   if (anzahlLOWBAT===0) textLOWBAT.push("- keine -");   

   // Schleife ist durchlaufen. Im Log wird der aktuelle Status (Anzahl, davon LOWBAT zutreffend) ausgegeben
   log("Text: " + textLOWBAT);
   log("Anzahl Geräte: " + moeglicheLOWBAT + " # davon LOWBAT erkannt: " +  anzahlLOWBAT);

   // die ermittelten Werte werden als javascript.0. Variable in ioBroker gespeichert (z.B. für die Verarbeitung in VIS)
   setState("zählenLowbat.textLOWBAT",     textLOWBAT.join(',<br>')); // Schreibt die aktuelle Namen der Geräte mit LOWBAT Meldung
   setState("zählenLowbat.anzahlLOWBAT",  anzahlLOWBAT);        // Schreibt die aktuelle Anzahl der Geräte im System
   setState("zählenLowbat.möglicheLOWBAT", moeglicheLOWBAT);          // Schreibt die aktuelle Anzahl der vorhandene Geräte 
}

cacheSelectorLOWBAT.on(function(obj) {    // bei Zustandänderung *. LOWBAT in allen Gewerken
   countLowbat(obj);
});
countLowbat();
schedule("*/60 * * * *", function () {                                  //oder!! soll entweder ausgelöst werden alle 10 Minuten
   log("===>Will be triggered every 60 minutes!"); 
   countLowbat();
});
