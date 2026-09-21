# PDF Maker

Webbaserad A4-editor med drag-och-släpp, text, bilder och gemensam sidfot.

## Starta på webben
Aktivera **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Ingen byggprocess eller installation behövs.

## Användning
- Dra en layout (kolumner × rader) till A4-sidan eller klicka på layouten.
- Välj text eller bild i varje ruta. Egenskaperna låter dig justera blockhöjd, textstorlek och bildanpassning.
- Lägg till sidor; sidfot och sidnumrering styrs gemensamt.
- **Exportera PDF**: välj Spara som PDF, A4, 100 % skala och stäng av webbläsarens sidhuvud och sidfot.
- **Spara projekt** laddar ner en redigerbar JSON-fil med bilder och text. **Öppna projekt** läser tillbaka den.

Dokument hanteras lokalt i webbläsaren och skickas inte till GitHub eller Drive. Spara projekt innan fliken stängs.

## Lokal användning
Ladda ner repot och öppna index.html. Behåll style.css och app.js i samma mapp. Inga externa beroenden.
