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


## Utökad editor
- Textstilar: brödtext, titel och undertitel. Fetstil, storlek, radavstånd samt vänster-, höger-, center- och marginaljustering gäller hela textrutan.
- Automatisk svensk avstavning kan slås på per ruta. Språkstödet varierar mellan webbläsare och operativsystem.
- Nio layouter, inklusive tre kolumner, tre rader, 3 × 2 samt tre små rutor bredvid en stor (båda riktningarna).
- Dra de blå gränserna mellan rutorna för att fördela bredd och höjd. Dra greppet under blocket för totalhöjd. Tangentbord: fokusera gränsen med Tab och använd piltangenterna; Shift ger större steg.
- Bilder: fyll/beskär, visa hela eller sträck. Zoom 100–300 %, vågrätt/lodrätt läge och återställning.
- Projektformat version 2 sparar alla inställningar och öppnar även äldre version 1-filer.

## Kontrollera dokumentmodellen
Kör `node --test model.test.cjs` för migration, sidgränser, rutproportioner och validering av projektfiler.

## Sidhuvud, sidfot och layoutmått (version 3)
- Gemensamt sidhuvud och sidfot med separata av/på-reglage, text samt PNG-, JPEG- eller WebP-logotyp. Bildens bredd och vänster-/högerplacering kan justeras. Bildernas proportioner bevaras.
- Avstängda sidband behåller sina inställningar men exporteras inte. Frigjort utrymme kan användas av innehållet. Aktivering som skulle orsaka överlappning stoppas med ett meddelande.
- Varje block har separata vågräta och lodräta mellanrum (0–20 mm). Avståndet mellan block styrs gemensamt.
- Blockhöjd ned till 0,1 mm; rutproportionerna kan dras under den tidigare gränsen på 8 %. Vid mycket liten totalhöjd minskas mellanrummet automatiskt så att rutorna får plats. Innehåll som inte ryms behöver anpassas före PDF-export.
- Totalt 15 layouter. Sex nya: fyra kolumner, stor ruta överst, stor ruta nederst, sidokolumn vänster, sidokolumn höger och stor mittruta.
- Nya projektfiler använder version 3. Version 1 och 2 kan fortfarande öppnas.
