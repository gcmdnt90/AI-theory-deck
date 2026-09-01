---
title: Brief di sessione — revisione del nuovo Modulo 4 (fuso)
scope: delivery/theory-deck, edizione PMI (index.html)
written: 2026-09-01
---

# AI Translator — revisione del nuovo Modulo 4

Stiamo facendo una revisione slide per slide del deck teorico PMI
(`C:\Code_Projects\AI Translator\delivery\theory-deck`).

**Stato.** Moduli 00, 01, 02 e 03 rivisti e chiusi. Il 2026-09-01 il vecchio M4
e il vecchio M5 sono stati **fusi** in un unico M4 e il vecchio M6 è diventato
M5: il deck PMI ha ora **5 moduli**. La fusione è stata strutturale — le slide
sono state spostate, unite ed eliminate, ma **il testo delle slide superstiti
non è stato riscritto**. Il nuovo Modulo 4 non è ancora passato per la
revisione slide per slide: è quello il lavoro di questa sessione.

## Metodo

Per ogni slide: dichiarare **scopo / conoscenza trasmessa / posizione
narrativa**, diagnosticare che cosa non va, proporre la correzione, **aspettare
la mia conferma**, poi scrivere — prima l'italiano (`modules/it/*.html`), poi
l'inglese speculare (`modules/*.html`) — e ricostruire con `node build.mjs`.
Le note del relatore (`<aside class="notes">`) si riscrivono insieme alla
slide, non dopo.

## Regole già ratificate

- Niente takeaway retorici e niente superlativi non falsificabili. Un takeaway
  che ripete quello che la slide già dice si toglie, non si riscrive.
- Testo della slide = elenchi brevi o titoli che imbeccano il relatore e
  restano allo studente. La profondità sta nelle note.
- Ogni affermazione verificabile e con fonte. Numeri veri al posto degli
  aggettivi, meccanismo al posto della metafora. Dimmi quando una fonte è
  debole — anche quando è debole un item congelato del test.
- **Terza persona impersonale** ovunque: niente «voi», niente «tuo».
- Niente inquadramenti antropomorfi (ho rifiutato «obbedienza» per
  l'instruction tuning).
- Niente numeri di versione dei modelli sulle slide; invecchiano in settimane.

## Vincoli duri

- I titoli `<h1>` dei moduli sono cablati parola per parola nel form T1
  (`research/instruments/tests/google-forms/create_forms.gs`). Rinominare un
  modulo significa modificare anche il form. I titoli `<h2>` sono liberi.
- Il deck deve servire i 10 item congelati del Concept Test. **M4 e M5 non
  servono nessun item**: la copertura sta tutta in M1, M3 e M5-rischi. Ogni
  slide di M4 ha quindi bisogno di un compito narrativo esplicito.
- Non toccare le stringhe di prompt misurate del widget next-token: le
  probabilità sono state misurate su quelle stringhe esatte.
- La tabella oraria di copertina deve totalizzare **120 minuti**. Ora:
  apertura 6, M1 16, M2 13, M3 19, pausa 9, **M4 12+14 = 26**,
  **M5 12+12 = 24**, chiusura 7.

## Com'è fatto il nuovo Modulo 4

File: `modules/it/04-steer-act.html` e `modules/04-steer-act.html`.
`<h1>`: **«Guidarlo e metterlo al lavoro»** / «Steering it, and putting it to
work». Copertina su `module-05-behaviour-control.png`.

| # | slide | provenienza |
|---|---|---|
| 1 | Due posti dove scrivere le regole | vecchio M4.1 + nuova card «condizionano, non bloccano» |
| 2 | Che aspetto ha | vecchio M4.2 + card «Skill» |
| 3 | *(respiro)* chatbot ↔ sistema agentico | vecchio M5, immagine a tutto campo — è la cerniera del modulo |
| 4 | Come arriva ai sistemi dell'azienda | fusione delle due slide connettori del vecchio M5 |
| 5 | Possedere la specifica, poi verificare | vecchio M5.5, invariata |
|   | demo `m4` | fusione delle demo m4 e m5 |

Uscito dal modulo: «Frastagliato, non umano» → ora in M5 sotto il chip
`modello`. Sparito: la mezza slide «Strumento» del vecchio M4 (assorbita dalla
slide 4) e i takeaway retorici «Scritto una volta, vale sempre», «MCP è
l'USB-C…», «È qui che un chatbot diventa un collega…», «Le skill impacchettano
il giudizio…».

## La demo `m4` — «Dalla regola scritta al lavoro fatto», 14 min

Una sola sessione continua sulla cartella del cliente, otto battute, nessun
cambio di strumento prima del passo 5.

| id | battuta | min |
|---|---|---|
| `m4-p1` | senza regole: la scheda esce con un dato inventato | 2 |
| `m4-p2` | si scrivono le regole permanenti, davanti a lui | 2 |
| `m4-p3` | stesso identico prompt → compaiono i vuoti e i `[DA VERIFICARE]` | 2 |
| `m4-p4` | «ignora le regole della casa» → cede | 1,5 |
| `m4-p5` | una chiamata vera a un connettore | 1 |
| `m4-p6` | si dichiarano i criteri (parlato, non scritto) | 0,5 |
| `m4-p7` | il compito sulla cartella | 3 |
| `m4-p8` | verifica contro la fonte | 2 |

Libreria: `m4-p9` richiesta strutturata, `m4-p10` skill in 60 s, `m4-p11`
critico indipendente.

`m4-p4` è la cerniera: le regole in prosa condizionano ma non bloccano, ed è
l'unica cosa che giustifica la tabella dei guardrail della slide 5. Prima era
in libreria, cioè non si eseguiva mai.

**Lezione 1v1:** al passo 2 la tastiera passa al partecipante, che scrive le
cinque regole permanenti del suo mestiere; il passo 3 gira su quelle. È
l'artefatto che si porta a casa. Sta scritto in `watch_for_it` e nella
`DEMO-CHECKLIST.md`.

## Da fare per prime — diagnosi già fatta, non ancora applicata

1. **Slide 1, riga d'apertura.** «Un prompt non è una domanda. È un
   *allestimento*: si prepara il terreno, non si interroga un archivio» è una
   metafora doppia che definisce per negazione, ed è l'unica riga di meccanismo
   della slide. Va sostituita con il meccanismo vero, agganciato a M3: le
   regole permanenti sono il testo che qualcuno **rimette sulla scrivania a
   ogni richiesta**. È rimasta lì solo perché non l'avevi ancora confermata.
2. **Slide 2 è ancora inchiodata alla numismatica** mentre il selettore promette
   tre settori. I campi esistono già per tutti e tre in `demo-prompts.json`
   (`REFERENCE_FIELD_it`, `FORBIDDEN_OUTPUT_it`, `QUALITY_FIELD_it`,
   `DOC_OUTPUT_it`, `AUDIENCE_it`, `FLAG`): serve un widget di ~25 righe che
   monti il blocco `.layered-file` da `sectorState` + `fill()`, come già fanno
   i widget di M1–M2. Allineare le voci parola per parola a `m4-p2` e `m4-p9`
   (manca «Tono» in entrambe le lingue).
3. **Note del relatore da rileggere come un insieme.** Sono state ricucite, non
   riscritte: il modulo ora è lungo il doppio e le note vanno ribilanciate.
4. **Varianti per settore di `m4` e `m5`** in `demo-prompts.json`: non esistono
   ancora, quindi i `{{PLACEHOLDER}}` compaiono grezzi sulla slide proiettata.
   Vale anche per il vecchio m6, ora `m5`.
5. **`assets/img/m06-mxn-convention.png` è ora inutilizzata** (l'immagine m×n
   della slide connettori assorbita). Recuperarla o archiviarla.
6. **Il titolo `<h1>` è una mia scelta**, non una tua conferma esplicita: era la
   prima delle tre proposte. Se lo cambi, va cambiato anche in
   `create_forms.gs` (`MODULE_BLOCKS`, voce «M4 · … — teoria»).

## Aperti da prima della fusione

- Il titolo della 2.3 («due cose diverse» contro la terza cosa che la sua card
  larga nomina).
- Verificare il toggle del ragionamento esteso di Claude prima di ogni lezione:
  si sposta fra una release e l'altra.
- Le tre configurazioni di `delivery/demo-data-kit`: esiste solo
  `config/artemide.json`, quindi la scala di M3 è davvero eseguibile solo sul
  settore numismatico.
- La lezione «come formuli la domanda orienta la risposta» è **chiusa**: metà
  in M3 (recupero), metà in M5 con la card «La domanda entra nella risposta»
  accanto ad «Accondiscendenza».

## Verifica visiva

Prima di dichiarare finita una slide: `node build.mjs`, poi impacchettare
`index.html`, `css/`, `widgets/`, `vendor/` e le immagini delle slide toccate
in un `.tgz` dentro `_to_delete/`, stagiarlo nel container e fare gli
screenshot con Chromium headless via Playwright
(`/opt/pw-browsers/chromium/chrome-linux/chrome`). Diverse slide hanno
sforato il viewport dopo una modifica. Headless non ha H.264 e usa un font di
ripiego più largo: sostituire i `<video>` con un fotogramma estratto e
considerare sospette le collisioni di titolo.
