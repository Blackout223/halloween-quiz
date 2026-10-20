/*
 * Halloween Pub Quiz – question bank
 * ----------------------------------
 * This file is loaded with a plain <script> tag, so it works from file:// with no server.
 *
 * ROUNDS: one entry per category. `id` links questions to their round.
 *   { id, title, emoji, description }
 *
 * QUESTIONS: one object per question.
 *   {
 *     id:          unique string, e.g. "gk-01"
 *     round:       a round id from QUIZ_ROUNDS
 *     difficulty:  "easy" | "medium" | "hard"
 *     question:    text shown to players
 *     answer:      the accepted answer
 *     acceptAlso:  [] other answers the host may accept (surname only, spellings…)
 *     explanation: 1–2 sentences shown on the answer reveal
 *     clues:       OPTIONAL array, hardest clue first. If present, clues are revealed
 *                  one at a time (used by the "Who Am I?" round).
 *   }
 *
 * Questions appear in the order they are listed within each round.
 * To add a round, add an entry to QUIZ_ROUNDS and give its questions that round id.
 */

/*
 * SETTINGS
 *   siteUrl: the public address quizzers open on their phones, e.g.
 *            "https://yourname.github.io/halloween-quiz/". The join link and QR code use it.
 *            Leave it "" to use the address the host page is opened from (fine on GitHub Pages),
 *            or type it into the lobby screen instead.
 */
window.QUIZ_SETTINGS = {
  siteUrl: ""
};

window.QUIZ_ROUNDS = [
  { id: "general", title: "General Knowledge", emoji: "🎃", description: "A cauldron of Halloween-flavoured trivia." },
  { id: "film", title: "TV and Film", emoji: "🎬", description: "Horror classics, Halloween episodes and movie monsters." },
  { id: "music", title: "Music", emoji: "🎵", description: "Spooky songs, artists and soundtracks. Titles, artists and years only." },
  { id: "history", title: "History and Folklore", emoji: "📜", description: "Samhain, witch trials, vampires and werewolves." },
  { id: "science", title: "Science and Nature", emoji: "🦇", description: "Bats, spiders, pumpkins, the Moon and the science of fear." },
  { id: "literature", title: "Literature", emoji: "📖", description: "Gothic novels, ghost stories and masters of horror." },
  { id: "food", title: "Food and Traditions", emoji: "🍎", description: "Halloween around the world, the Day of the Dead and Bonfire Night." },
  { id: "anime", title: "Anime Spirits", emoji: "⚔️", description: "Ghost-type Pokémon, demons and curses: Pokémon, Demon Slayer and Jujutsu Kaisen." },
  { id: "whoami", title: "Who Am I?", emoji: "❓", description: "Clues are revealed one at a time and get easier as they go. Write your answer down whenever you think you know it." }
];

window.QUIZ_QUESTIONS = [
  /* ---------------- ROUND 1: GENERAL KNOWLEDGE ---------------- */
  {
    id: "gk-01", round: "general", difficulty: "easy",
    question: "The word ‘Halloween’ is a shortened form of which phrase?",
    answer: "All Hallows' Eve",
    acceptAlso: ["All Hallows' Evening", "All Hallows' Even"],
    explanation: "‘Hallow’ is an old word for a saint. Halloween is the evening before All Hallows' Day (All Saints' Day) on 1 November."
  },
  {
    id: "gk-02", round: "general", difficulty: "easy",
    question: "Transylvania, home of the fictional Count Dracula, is a region of which modern country?",
    answer: "Romania",
    acceptAlso: [],
    explanation: "Transylvania is a historic region in central Romania. Bram Stoker never visited it; he researched it from books."
  },
  {
    id: "gk-03", round: "general", difficulty: "easy",
    question: "What long, curved-bladed farming tool is the Grim Reaper traditionally shown carrying?",
    answer: "A scythe",
    acceptAlso: [],
    explanation: "A scythe was used to cut crops, so the Grim Reaper carrying one shows death ‘harvesting’ souls."
  },
  {
    id: "gk-04", round: "general", difficulty: "medium",
    question: "What is the name of the legendary ghost ship said to be doomed to sail the oceans forever, never able to make port?",
    answer: "The Flying Dutchman",
    acceptAlso: [],
    explanation: "Sailors have told the legend since at least the 18th century. It inspired Wagner's 1843 opera Der fliegende Holländer."
  },
  {
    id: "gk-05", round: "general", difficulty: "medium",
    question: "Triskaidekaphobia is the fear of which number?",
    answer: "13",
    acceptAlso: ["Thirteen"],
    explanation: "It comes from the Greek for ‘three and ten’. Fear of Friday the 13th in particular is sometimes called paraskevidekatriaphobia."
  },
  {
    id: "gk-06", round: "general", difficulty: "medium",
    question: "According to legend, the kingdom will fall if which birds ever leave the Tower of London?",
    answer: "Ravens",
    acceptAlso: [],
    explanation: "By tradition at least six ravens are kept at the Tower. A Yeoman Warder known as the Ravenmaster looks after them."
  },
  {
    id: "gk-07", round: "general", difficulty: "medium",
    question: "In folklore, what name is given to a witch's supernatural helper that takes the form of an animal, such as a black cat or a toad?",
    answer: "A familiar",
    acceptAlso: ["Familiar spirit"],
    explanation: "Accusations of keeping familiars were common in English witch trials of the 16th and 17th centuries."
  },
  {
    id: "gk-08", round: "general", difficulty: "medium",
    question: "Which word for a mischievous, noisy ghost comes from German words meaning ‘to make a racket’ and ‘ghost’?",
    answer: "Poltergeist",
    acceptAlso: [],
    explanation: "It combines the German ‘poltern’ (to make noise or rumble) and ‘Geist’ (ghost or spirit)."
  },
  {
    id: "gk-09", round: "general", difficulty: "hard",
    question: "What Latin phrase, meaning ‘remember that you must die’, describes art or objects such as skulls and hourglasses that remind us of our mortality?",
    answer: "Memento mori",
    acceptAlso: [],
    explanation: "Memento mori objects were especially popular in medieval and 17th-century European art, such as Dutch still-life paintings."
  },
  {
    id: "gk-10", round: "general", difficulty: "hard",
    question: "In the Harry Potter books, what is the name of the ghost of Hufflepuff house?",
    answer: "The Fat Friar",
    acceptAlso: [],
    explanation: "The other house ghosts are Nearly Headless Nick (Gryffindor), the Grey Lady (Ravenclaw) and the Bloody Baron (Slytherin)."
  },

  /* ---------------- ROUND 2: TV AND FILM ---------------- */
  {
    id: "tv-01", round: "film", difficulty: "easy",
    question: "In which 1978 horror film does the masked killer Michael Myers first appear?",
    answer: "Halloween",
    acceptAlso: [],
    explanation: "Jamie Lee Curtis starred as babysitter Laurie Strode. The story is set on Halloween night in a small Illinois town."
  },
  {
    id: "tv-02", round: "film", difficulty: "easy",
    question: "What is the name of the Addams Family's towering, deep-voiced butler?",
    answer: "Lurch",
    acceptAlso: [],
    explanation: "Lurch was played by Ted Cassidy in the 1960s TV series The Addams Family."
  },
  {
    id: "tv-03", round: "film", difficulty: "easy",
    question: "In Ghostbusters (1984), what giant creature made of a sweet treat stomps through New York?",
    answer: "The Stay Puft Marshmallow Man",
    acceptAlso: ["Stay Puft", "The Marshmallow Man", "Mr Stay Puft"],
    explanation: "Told to choose the form of their destroyer, Ray Stantz tries to think of something harmless and pictures the Stay Puft mascot."
  },
  {
    id: "tv-04", round: "film", difficulty: "medium",
    question: "Who directed the 1960 film Psycho?",
    answer: "Alfred Hitchcock",
    acceptAlso: ["Hitchcock"],
    explanation: "Psycho starred Anthony Perkins as Norman Bates and Janet Leigh, and is famous for its shower scene and Bernard Herrmann's shrieking string score."
  },
  {
    id: "tv-05", round: "film", difficulty: "medium",
    question: "Which British film company, based for many years at Bray Studios in Berkshire, made the 1957 gothic horror The Curse of Frankenstein?",
    answer: "Hammer",
    acceptAlso: ["Hammer Films", "Hammer Film Productions", "Hammer Horror"],
    explanation: "The Curse of Frankenstein was Hammer's first colour gothic horror. Its success led to Dracula (1958) and many more horror films."
  },
  {
    id: "tv-06", round: "film", difficulty: "medium",
    question: "In Stanley Kubrick's The Shining (1980), what is the name of the hotel where the Torrance family spend the winter?",
    answer: "The Overlook Hotel",
    acceptAlso: ["The Overlook"],
    explanation: "The hotel is in the Colorado mountains in the story; the exterior shots were filmed at Timberline Lodge in Oregon."
  },
  {
    id: "tv-07", round: "film", difficulty: "medium",
    question: "What is the name of The Simpsons' annual series of Halloween episodes?",
    answer: "Treehouse of Horror",
    acceptAlso: [],
    explanation: "The first Treehouse of Horror aired in October 1990. The episodes are standalone spooky stories outside the show's normal continuity."
  },
  {
    id: "tv-08", round: "film", difficulty: "medium",
    question: "In the 1996 slasher film Scream, what name is given to the black-robed killer persona with the white mask?",
    answer: "Ghostface",
    acceptAlso: ["Ghost Face"],
    explanation: "Directed by Wes Craven, Scream reveals two killers who share the Ghostface disguise."
  },
  {
    id: "tv-09", round: "film", difficulty: "hard",
    question: "Who directed Universal's 1931 film Frankenstein?",
    answer: "James Whale",
    acceptAlso: ["Whale"],
    explanation: "English director James Whale also made The Invisible Man (1933) and Bride of Frankenstein (1935)."
  },
  {
    id: "tv-10", round: "film", difficulty: "hard",
    question: "In what year was the British folk-horror film The Wicker Man, starring Edward Woodward, released?",
    answer: "1973",
    acceptAlso: [],
    explanation: "Directed by Robin Hardy, it follows Sergeant Howie's search for a missing girl on the remote Scottish island of Summerisle."
  },

  /* ---------------- ROUND 3: MUSIC ---------------- */
  {
    id: "mu-01", round: "music", difficulty: "easy",
    question: "Which Michael Jackson song has a famous music video in which he dances with zombies?",
    answer: "Thriller",
    acceptAlso: [],
    explanation: "It is the title track of his 1982 album. The nearly 14-minute video premiered in December 1983."
  },
  {
    id: "mu-02", round: "music", difficulty: "easy",
    question: "Ray Parker Jr. sang the theme song to which 1984 film?",
    answer: "Ghostbusters",
    acceptAlso: [],
    explanation: "The song topped the US Billboard Hot 100 and was nominated for the Academy Award for Best Original Song."
  },
  {
    id: "mu-03", round: "music", difficulty: "easy",
    question: "Which singer released the 1977 album Bat Out of Hell?",
    answer: "Meat Loaf",
    acceptAlso: [],
    explanation: "The songs were written by Jim Steinman and the album was produced by Todd Rundgren."
  },
  {
    id: "mu-04", round: "music", difficulty: "medium",
    question: "Which performer had a 1962 novelty hit with ‘Monster Mash’?",
    answer: "Bobby “Boris” Pickett",
    acceptAlso: ["Bobby Pickett", "Boris Pickett", "Bobby “Boris” Pickett and the Crypt-Kickers"],
    explanation: "Pickett sang it in the voice of a classic horror film star. It reached number one in the US in October 1962."
  },
  {
    id: "mu-05", round: "music", difficulty: "medium",
    question: "Which French composer wrote the 1874 orchestral piece ‘Danse macabre’, in which a solo violin represents Death playing at midnight?",
    answer: "Camille Saint-Saëns",
    acceptAlso: ["Saint-Saëns", "Saint-Saens"],
    explanation: "The piece is based on a poem by Henri Cazalis and uses a xylophone to imitate rattling bones."
  },
  {
    id: "mu-06", round: "music", difficulty: "medium",
    question: "The opening of Mike Oldfield's 1973 album Tubular Bells became famous after it was used in which horror film released that same year?",
    answer: "The Exorcist",
    acceptAlso: [],
    explanation: "Tubular Bells was the first album released on Richard Branson's Virgin Records label."
  },
  {
    id: "mu-07", round: "music", difficulty: "medium",
    question: "Which Russian composer wrote ‘Night on Bald Mountain’, used in the final section of Disney's Fantasia (1940)?",
    answer: "Modest Mussorgsky",
    acceptAlso: ["Mussorgsky", "Moussorgsky"],
    explanation: "Fantasia used Leopold Stokowski's arrangement of Rimsky-Korsakov's version, followed by Schubert's ‘Ave Maria’."
  },
  {
    id: "mu-08", round: "music", difficulty: "medium",
    question: "Which Coventry band had a UK number one in 1981 with ‘Ghost Town’?",
    answer: "The Specials",
    acceptAlso: ["Specials"],
    explanation: "Released in summer 1981, its eerie sound captured a time of high unemployment and unrest in British cities."
  },
  {
    id: "mu-09", round: "music", difficulty: "hard",
    question: "Which Northampton band released the nine-minute-plus 1979 debut single ‘Bela Lugosi's Dead’?",
    answer: "Bauhaus",
    acceptAlso: [],
    explanation: "It is often cited as one of the first gothic rock records. The band perform it at the start of the 1983 vampire film The Hunger."
  },
  {
    id: "mu-10", round: "music", difficulty: "hard",
    question: "Which American director, who made An American Werewolf in London (1981), directed Michael Jackson's Thriller video?",
    answer: "John Landis",
    acceptAlso: ["Landis"],
    explanation: "Jackson approached Landis after seeing An American Werewolf in London. That film's make-up artist, Rick Baker, also worked on Thriller."
  },

  /* ---------------- ROUND 4: HISTORY AND FOLKLORE ---------------- */
  {
    id: "hi-01", round: "history", difficulty: "easy",
    question: "What is the name of the ancient Gaelic festival, marking the end of the harvest and the start of winter, from which many Halloween customs are thought to come?",
    answer: "Samhain",
    acceptAlso: ["Samain", "Samhuinn"],
    explanation: "Samhain was held around 31 October to 1 November, when the boundary between the living and the dead was believed to be thin. In modern Irish, ‘Samhain’ is the word for November."
  },
  {
    id: "hi-02", round: "history", difficulty: "easy",
    question: "Before pumpkins became widespread, what root vegetable was traditionally hollowed out and carved into lanterns in Ireland and Scotland?",
    answer: "Turnip",
    acceptAlso: ["Swede", "Neep", "Mangelwurzel", "Rutabaga"],
    explanation: "Carved turnips and swedes (‘neeps’ in Scotland) came first. Irish and Scottish emigrants in North America later took up the larger, easier-to-carve pumpkin."
  },
  {
    id: "hi-03", round: "history", difficulty: "easy",
    question: "In which Massachusetts settlement did the infamous witch trials of 1692 take place?",
    answer: "Salem",
    acceptAlso: ["Salem Village", "Salem Town"],
    explanation: "Over 200 people were accused and 19 were hanged. Salem Village is now the town of Danvers."
  },
  {
    id: "hi-04", round: "history", difficulty: "medium",
    question: "Vlad III, the 15th-century ruler of Wallachia often linked to Count Dracula, is better known by what nickname?",
    answer: "Vlad the Impaler",
    acceptAlso: ["The Impaler", "Vlad Țepeș", "Vlad Tepes"],
    explanation: "‘Țepeș’ is Romanian for ‘impaler’. He also signed himself Drăculea, ‘son of Dracul’, after his father's membership of the Order of the Dragon."
  },
  {
    id: "hi-05", round: "history", difficulty: "medium",
    question: "The famous Lancashire witch trials of 1612 are named after which hill?",
    answer: "Pendle Hill",
    acceptAlso: ["Pendle"],
    explanation: "Of the eleven people who went to trial in the Pendle witch trials, ten were found guilty and hanged."
  },
  {
    id: "hi-06", round: "history", difficulty: "medium",
    question: "In the Irish folk tale linked to the jack-o'-lantern, ‘Stingy Jack’ tricks which figure, and is later left to wander the earth with only a glowing coal for light?",
    answer: "The Devil",
    acceptAlso: ["Satan", "Lucifer", "Old Nick"],
    explanation: "Barred from both heaven and hell, Jack carries an ember in a carved turnip. The term ‘jack-o'-lantern’ itself was first used in England for a night watchman and for will-o'-the-wisp lights seen over marshes."
  },
  {
    id: "hi-07", round: "history", difficulty: "medium",
    question: "Which wailing female spirit of Irish folklore takes her name from the Irish ‘bean sí’, meaning ‘woman of the fairy mound’?",
    answer: "Banshee",
    acceptAlso: ["Bean sí", "Bean sidhe"],
    explanation: "The banshee's keening cry was said to warn that someone in the family was about to die."
  },
  {
    id: "hi-08", round: "history", difficulty: "medium",
    question: "In popular legend and horror films, a bullet made of which metal is needed to kill a werewolf?",
    answer: "Silver",
    acceptAlso: [],
    explanation: "The silver-bullet idea was popularised mainly by 19th- and 20th-century stories and films rather than by ancient folklore."
  },
  {
    id: "hi-09", round: "history", difficulty: "hard",
    question: "Who was the self-styled ‘Witchfinder General’ who led a witch-hunt across East Anglia between 1644 and 1646?",
    answer: "Matthew Hopkins",
    acceptAlso: ["Hopkins"],
    explanation: "Hopkins and his associate John Stearne used methods such as sleep deprivation to extract confessions. Hopkins died in 1647."
  },
  {
    id: "hi-10", round: "history", difficulty: "hard",
    question: "In 1944, the Scottish medium Helen Duncan was one of the last people in Britain convicted under a Witchcraft Act dating from which year?",
    answer: "1735",
    acceptAlso: [],
    explanation: "The Witchcraft Act 1735 made it a crime to claim magical powers rather than to be a witch. It was repealed in 1951."
  },

  /* ---------------- ROUND 5: SCIENCE AND NATURE ---------------- */
  {
    id: "sc-01", round: "science", difficulty: "easy",
    question: "What is the name of the technique many bats use to find their way and hunt in the dark by listening to the echoes of their own calls?",
    answer: "Echolocation",
    acceptAlso: ["Biosonar"],
    explanation: "Despite the saying ‘blind as a bat’, no bat species is blind; all of them can see."
  },
  {
    id: "sc-02", round: "science", difficulty: "easy",
    question: "How many legs does a spider have?",
    answer: "Eight",
    acceptAlso: ["8"],
    explanation: "Insects have six legs, so spiders are not insects. Spiders also have two body sections rather than three."
  },
  {
    id: "sc-03", round: "science", difficulty: "easy",
    question: "What is the only food of the vampire bat?",
    answer: "Blood",
    acceptAlso: [],
    explanation: "The three species of vampire bat, found from Mexico to South America, are the only mammals that feed entirely on blood."
  },
  {
    id: "sc-04", round: "science", difficulty: "medium",
    question: "Which pair of glands, sitting on top of the kidneys, releases adrenaline during the ‘fight or flight’ response?",
    answer: "The adrenal glands",
    acceptAlso: ["Adrenals", "Suprarenal glands"],
    explanation: "Adrenaline (also called epinephrine) speeds up the heart and breathing and sends more blood to the muscles, preparing the body to react to danger."
  },
  {
    id: "sc-05", round: "science", difficulty: "medium",
    question: "Which almond-shaped structure deep inside the brain plays a central role in detecting threats and processing fear?",
    answer: "The amygdala",
    acceptAlso: ["Amygdalae"],
    explanation: "Its name comes from the Greek for ‘almond’. There is one in each half of the brain."
  },
  {
    id: "sc-06", round: "science", difficulty: "medium",
    question: "In the Northern Hemisphere, what name is given to the full moon that falls closest to the autumn equinox?",
    answer: "The Harvest Moon",
    acceptAlso: [],
    explanation: "Around this time the Moon rises at similar times on several evenings in a row, traditionally giving farmers extra light to bring in the crops."
  },
  {
    id: "sc-07", round: "science", difficulty: "medium",
    question: "During a total lunar eclipse the Moon often looks red, a so-called ‘blood moon’. The red light reaching it has passed through which planet's atmosphere?",
    answer: "Earth's",
    acceptAlso: ["Earth", "The Earth's atmosphere"],
    explanation: "Earth's atmosphere scatters away blue light and bends red light into Earth's shadow. It is the same effect that makes sunsets red."
  },
  {
    id: "sc-08", round: "science", difficulty: "medium",
    question: "Spiders belong to which class of animals, which also includes scorpions, ticks and mites?",
    answer: "Arachnids",
    acceptAlso: ["Arachnida"],
    explanation: "The name comes from Arachne, a weaver in Greek myth who was turned into a spider."
  },
  {
    id: "sc-09", round: "science", difficulty: "hard",
    question: "Pumpkins, cucumbers, melons and courgettes all belong to the same plant family. What is it called?",
    answer: "Cucurbitaceae (the gourd family)",
    acceptAlso: ["Cucurbits", "Gourd family", "Cucurbit family"],
    explanation: "In botanical terms a pumpkin is a fruit: a type of berry known as a pepo."
  },
  {
    id: "sc-10", round: "science", difficulty: "hard",
    question: "What is the scientific term for hairs standing on end, which causes goosebumps when we are cold or frightened?",
    answer: "Piloerection",
    acceptAlso: ["Horripilation", "Pilomotor reflex", "Cutis anserina"],
    explanation: "Tiny arrector pili muscles at the base of each hair contract. In furrier animals the same reflex makes them look bigger to a threat."
  },

  /* ---------------- ROUND 6: LITERATURE ---------------- */
  {
    id: "li-01", round: "literature", difficulty: "easy",
    question: "Which author wrote the novel Frankenstein?",
    answer: "Mary Shelley",
    acceptAlso: ["Shelley", "Mary Wollstonecraft Shelley"],
    explanation: "She began the story aged 18 during a ghost-story challenge with Lord Byron and Percy Shelley at the Villa Diodati near Geneva in 1816. (Percy Shelley is not accepted.)"
  },
  {
    id: "li-02", round: "literature", difficulty: "easy",
    question: "Which Irish author wrote the 1897 novel Dracula?",
    answer: "Bram Stoker",
    acceptAlso: ["Stoker", "Abraham Stoker"],
    explanation: "Stoker was born in Dublin and worked for many years as manager of the Lyceum Theatre in London."
  },
  {
    id: "li-03", round: "literature", difficulty: "easy",
    question: "Which narrative poem by Edgar Allan Poe, first published in 1845, features a talking bird that visits a grieving narrator at midnight?",
    answer: "The Raven",
    acceptAlso: [],
    explanation: "The poem made Poe famous almost overnight. The narrator is mourning his lost love, Lenore."
  },
  {
    id: "li-04", round: "literature", difficulty: "medium",
    question: "Complete the full original title of the novel: ‘Frankenstein; or, The Modern …’",
    answer: "Prometheus",
    acceptAlso: [],
    explanation: "In Greek myth the Titan Prometheus defied the gods by giving fire to humankind, just as Victor Frankenstein oversteps by creating life."
  },
  {
    id: "li-05", round: "literature", difficulty: "medium",
    question: "In the novel Dracula, the Count's ship runs aground at which Yorkshire seaside town?",
    answer: "Whitby",
    acceptAlso: [],
    explanation: "Stoker holidayed in Whitby in 1890 and came across the name ‘Dracula’ in a book in the town's library."
  },
  {
    id: "li-06", round: "literature", difficulty: "medium",
    question: "What was Stephen King's first published novel, released in 1974?",
    answer: "Carrie",
    acceptAlso: [],
    explanation: "It tells the story of a bullied teenager with telekinetic powers. King threw an early draft away, and his wife Tabitha rescued it from the bin."
  },
  {
    id: "li-07", round: "literature", difficulty: "medium",
    question: "Which Scottish author wrote the 1886 novella Strange Case of Dr Jekyll and Mr Hyde?",
    answer: "Robert Louis Stevenson",
    acceptAlso: ["Stevenson", "R. L. Stevenson"],
    explanation: "Stevenson, who also wrote Treasure Island, set the story in London. ‘Jekyll and Hyde’ is now used to describe someone with two very different sides."
  },
  {
    id: "li-08", round: "literature", difficulty: "medium",
    question: "Complete the title of Shirley Jackson's 1959 novel: ‘The Haunting of …’",
    answer: "Hill House",
    acceptAlso: [],
    explanation: "It follows four people staying in a supposedly haunted mansion. It was filmed as The Haunting (1963) and loosely adapted as a 2018 Netflix series."
  },
  {
    id: "li-09", round: "literature", difficulty: "hard",
    question: "In what year was Frankenstein first published?",
    answer: "1818",
    acceptAlso: [],
    explanation: "It was published anonymously in London on 1 January 1818. Mary Shelley's name first appeared on the British second edition in 1823."
  },
  {
    id: "li-10", round: "literature", difficulty: "hard",
    question: "In the novel Dracula, what is the name of the Russian ship that carries the Count to England?",
    answer: "The Demeter",
    acceptAlso: ["Demeter"],
    explanation: "The Demeter sails from Varna. Its captain's log, found after the wreck, records the crew disappearing one by one."
  },

  /* ---------------- ROUND 7: FOOD AND TRADITIONS ---------------- */
  {
    id: "fo-01", round: "food", difficulty: "easy",
    question: "On what date is Bonfire Night celebrated in the UK?",
    answer: "5 November",
    acceptAlso: ["5th November", "November 5th"],
    explanation: "It marks the failure of the Gunpowder Plot in 1605, after which Parliament made 5 November a day of thanksgiving."
  },
  {
    id: "fo-02", round: "food", difficulty: "easy",
    question: "Which Gunpowder Plot conspirator, caught guarding the explosives beneath the House of Lords, is traditionally burned in effigy on Bonfire Night?",
    answer: "Guy Fawkes",
    acceptAlso: ["Fawkes", "Guido Fawkes"],
    explanation: "Fawkes was arrested around midnight on 4–5 November 1605. The effigies burned on bonfires are still called ‘guys’."
  },
  {
    id: "fo-03", round: "food", difficulty: "easy",
    question: "What autumn treat is made by coating a whole apple on a stick in hard, glossy, usually red sugar syrup?",
    answer: "A toffee apple",
    acceptAlso: ["Candy apple"],
    explanation: "Toffee apples are a Bonfire Night and Halloween favourite in the UK. In the US they are usually called candy apples."
  },
  {
    id: "fo-04", round: "food", difficulty: "medium",
    question: "What is the name of the Irish fruit loaf eaten at Halloween that traditionally has a ring baked inside?",
    answer: "Barmbrack",
    acceptAlso: ["Brack", "Báirín breac"],
    explanation: "Finding the ring was said to mean marriage within the year. Other items, such as a coin, a pea or a stick, foretold other fortunes."
  },
  {
    id: "fo-05", round: "food", difficulty: "medium",
    question: "In Scotland, what is the traditional name for going door to door in costume at Halloween and performing a song, poem or joke in return for a treat?",
    answer: "Guising",
    acceptAlso: ["Guisers", "Going guising"],
    explanation: "The word comes from ‘disguise’. Guisers traditionally had to perform for their reward rather than simply ask for it."
  },
  {
    id: "fo-06", round: "food", difficulty: "medium",
    question: "Which bright orange flower, known in Mexico as cempasúchil, is used to decorate Day of the Dead altars and graves?",
    answer: "Marigold",
    acceptAlso: ["Mexican marigold", "Aztec marigold"],
    explanation: "Their strong colour and scent are believed to help guide the spirits of the dead home to their families."
  },
  {
    id: "fo-07", round: "food", difficulty: "medium",
    question: "Day of the Dead home altars are called ‘ofrendas’. What does the Spanish word ‘ofrenda’ mean in English?",
    answer: "Offering",
    acceptAlso: ["An offering", "Offerings"],
    explanation: "Families decorate the ofrenda with photos, candles, flowers and the favourite food and drink of loved ones who have died."
  },
  {
    id: "fo-08", round: "food", difficulty: "medium",
    question: "Which Christian feast day for remembering the dead falls on 2 November?",
    answer: "All Souls' Day",
    acceptAlso: ["All Souls"],
    explanation: "It follows All Saints' Day on 1 November. In parts of England, people once went ‘souling’ door to door for small spiced soul cakes around this time."
  },
  {
    id: "fo-09", round: "food", difficulty: "hard",
    question: "The traditional celebration called ‘Hop-tu-Naa’ is held every 31 October on which island?",
    answer: "The Isle of Man",
    acceptAlso: ["Mann", "Ellan Vannin"],
    explanation: "Hop-tu-Naa is the Manx celebration of the old Celtic new year. Children carry carved turnips and sing traditional songs from door to door."
  },
  {
    id: "fo-10", round: "food", difficulty: "hard",
    question: "What is the Spanish name of the sweet bread, often topped with dough shaped like bones, that is baked for Mexico's Day of the Dead?",
    answer: "Pan de muerto",
    acceptAlso: ["Pan de muertos", "Pan de los muertos"],
    explanation: "The name means ‘bread of the dead’. It is often flavoured with orange blossom or anise."
  },

  /* ---------------- ANIME SPIRITS: POKÉMON, DEMON SLAYER, JUJUTSU KAISEN ---------------- */
  {
    id: "an-01", round: "anime", difficulty: "easy",
    question: "In Pokémon, Gastly evolves into Haunter. What does Haunter evolve into when it is traded?",
    answer: "Gengar",
    acceptAlso: [],
    explanation: "Gastly, Haunter and Gengar are Ghost and Poison types, and have been since Pokémon Red and Blue."
  },
  {
    id: "an-02", round: "anime", difficulty: "easy",
    question: "In Demon Slayer, what is the name of Tanjiro's younger sister, who is turned into a demon?",
    answer: "Nezuko",
    acceptAlso: ["Nezuko Kamado"],
    explanation: "Tanjiro becomes a demon slayer to find a way to turn Nezuko back into a human. She carries a bamboo muzzle in her mouth."
  },
  {
    id: "an-03", round: "anime", difficulty: "easy",
    question: "In Jujutsu Kaisen, which white-haired teacher, usually shown wearing a blindfold, is known as the strongest jujutsu sorcerer?",
    answer: "Satoru Gojo",
    acceptAlso: ["Gojo", "Gojo Satoru"],
    explanation: "Gojo teaches at Tokyo Jujutsu High and is Yuji Itadori's teacher."
  },
  {
    id: "an-04", round: "anime", difficulty: "medium",
    question: "Which Ghost-type Pokémon hides under a homemade rag costume designed to look like Pikachu?",
    answer: "Mimikyu",
    acceptAlso: [],
    explanation: "Mimikyu was introduced in Pokémon Sun and Moon and is a Ghost and Fairy type."
  },
  {
    id: "an-05", round: "anime", difficulty: "medium",
    question: "Litwick is a Pokémon that looks like a living candle. Name either of its two types.",
    answer: "Ghost or Fire",
    acceptAlso: ["Ghost", "Fire", "Ghost and Fire", "Fire and Ghost"],
    explanation: "Litwick is a Ghost and Fire type, as are its evolutions Lampent and Chandelure."
  },
  {
    id: "an-06", round: "anime", difficulty: "medium",
    question: "Demon Slayer's original Japanese title is ‘Kimetsu no …’ what?",
    answer: "Yaiba",
    acceptAlso: ["Kimetsu no Yaiba"],
    explanation: "Kimetsu no Yaiba roughly means ‘blade of demon destruction’."
  },
  {
    id: "an-07", round: "anime", difficulty: "medium",
    question: "In Demon Slayer, what name is given to the special swords that demon slayers use, forged from ore that absorbs sunlight?",
    answer: "Nichirin swords",
    acceptAlso: ["Nichirin", "Nichirin blades"],
    explanation: "Demons in the series are destroyed by sunlight or by being beheaded with a Nichirin blade, which is why demon slayers carry them."
  },
  {
    id: "an-08", round: "anime", difficulty: "medium",
    question: "In Jujutsu Kaisen, Yuji Itadori swallows a cursed finger belonging to which ‘King of Curses’?",
    answer: "Ryomen Sukuna",
    acceptAlso: ["Sukuna"],
    explanation: "Swallowing the finger makes Yuji Sukuna's vessel, and he is then sentenced to death once he has eaten all twenty fingers."
  },
  {
    id: "an-09", round: "anime", difficulty: "hard",
    question: "In the original Pokémon Red and Blue games, which town is home to the Pokémon Tower, a building full of graves and ghosts?",
    answer: "Lavender Town",
    acceptAlso: ["Lavender"],
    explanation: "The Pokémon Tower is where trainers lay their Pokémon to rest, and you need the Silph Scope to identify the ghosts there."
  },
  {
    id: "an-10", round: "anime", difficulty: "hard",
    question: "What is the pen name of the manga artist who created Jujutsu Kaisen?",
    answer: "Gege Akutami",
    acceptAlso: ["Akutami"],
    explanation: "Jujutsu Kaisen ran in Shueisha's Weekly Shōnen Jump magazine from 2018 to 2024."
  },

  /* ---------------- ROUND 8: WHO AM I? (clues get easier) ---------------- */
  {
    id: "wa-01", round: "whoami", difficulty: "easy",
    question: "Who am I?",
    clues: [
      "I was born in St Louis, Missouri, in 1911.",
      "I starred in House of Wax (1953) and in a series of Edgar Allan Poe films directed by Roger Corman.",
      "One of my last film roles was the elderly inventor in Edward Scissorhands (1990).",
      "My spoken-word section features on Michael Jackson's ‘Thriller’."
    ],
    answer: "Vincent Price",
    acceptAlso: ["Price"],
    explanation: "Price was famous for his distinctive voice. He was also a serious art collector and co-wrote cookbooks with his wife, Mary."
  },
  {
    id: "wa-02", round: "whoami", difficulty: "easy",
    question: "Who am I?",
    clues: [
      "Lisa Loring first played me on television in 1964.",
      "My first name comes from a traditional fortune-telling rhyme about the days of the week.",
      "Christina Ricci played me in two films in the early 1990s.",
      "Jenna Ortega played me in a 2022 Netflix series named after me."
    ],
    answer: "Wednesday Addams",
    acceptAlso: ["Wednesday"],
    explanation: "The Addams Family began as cartoons by Charles Addams in The New Yorker; Wednesday got her name when the family came to TV, after the rhyme's ‘full of woe’ child."
  },
  {
    id: "wa-03", round: "whoami", difficulty: "easy",
    question: "Who am I?",
    clues: [
      "I was born in Burbank, California, in 1958, and worked as an animator at Disney early in my career.",
      "I directed Beetlejuice (1988) and Batman (1989).",
      "I directed Sleepy Hollow (1999) and Sweeney Todd (2007).",
      "Many people think I directed The Nightmare Before Christmas (1993), but I came up with the story and produced it."
    ],
    answer: "Tim Burton",
    acceptAlso: ["Burton"],
    explanation: "The Nightmare Before Christmas was directed by Henry Selick, a common quiz trap. Burton conceived the story and characters and produced the film."
  },
  {
    id: "wa-04", round: "whoami", difficulty: "medium",
    question: "Who am I?",
    clues: [
      "I was born William Henry Pratt in London in 1887.",
      "I narrated and voiced the title character in the 1966 TV cartoon How the Grinch Stole Christmas!",
      "I played Imhotep in The Mummy (1932).",
      "I played the Monster in Universal's Frankenstein (1931)."
    ],
    answer: "Boris Karloff",
    acceptAlso: ["Karloff"],
    explanation: "He adopted the stage name early in his acting career. Playing Frankenstein's Monster made him a star."
  },
  {
    id: "wa-05", round: "whoami", difficulty: "medium",
    question: "Who am I?",
    clues: [
      "I was born Erik Weisz in Budapest in 1874.",
      "In the 1920s I campaigned to expose fraudulent spiritualist mediums.",
      "I was famous for escaping from handcuffs, straitjackets and my Chinese Water Torture Cell.",
      "I took my stage name in tribute to the French magician Jean-Eugène Robert-Houdin."
    ],
    answer: "Harry Houdini",
    acceptAlso: ["Houdini"],
    explanation: "Houdini died on Halloween, 31 October 1926. His wife Bess held a séance every Halloween for ten years hoping to contact him."
  },
  {
    id: "wa-06", round: "whoami", difficulty: "medium",
    question: "Who am I?",
    clues: [
      "I was born in Carthage, New York, in 1948.",
      "I directed Escape from New York (1981) and The Thing (1982).",
      "I usually compose the music for my own films.",
      "I directed and scored the original Halloween (1978)."
    ],
    answer: "John Carpenter",
    acceptAlso: ["Carpenter"],
    explanation: "Carpenter wrote the famous Halloween theme himself, in the unusual time signature of 5/4."
  },
  {
    id: "wa-07", round: "whoami", difficulty: "medium",
    question: "Who am I?",
    clues: [
      "As a young woman I served at the French royal court.",
      "I was crowned Queen of England in 1533.",
      "I was beheaded at the Tower of London in 1536, and my ghost is said to haunt it.",
      "I was the second wife of Henry VIII and the mother of Elizabeth I."
    ],
    answer: "Anne Boleyn",
    acceptAlso: ["Boleyn"],
    explanation: "Anne was executed on Tower Green on 19 May 1536. Her ghost is also said to appear at Blickling Hall in Norfolk."
  },
  {
    id: "wa-08", round: "whoami", difficulty: "medium",
    question: "Who am I?",
    clues: [
      "I was born in London in 1922 and served with the RAF in the Second World War.",
      "I played the Bond villain Francisco Scaramanga in The Man with the Golden Gun (1974).",
      "I played Saruman in The Lord of the Rings films and Count Dooku in Star Wars.",
      "I played Count Dracula in Hammer's Dracula (1958) and many of its sequels."
    ],
    answer: "Christopher Lee",
    acceptAlso: ["Sir Christopher Lee"],
    explanation: "Lee was knighted in 2009. He was also the step-cousin of James Bond author Ian Fleming."
  },
  {
    id: "wa-09", round: "whoami", difficulty: "hard",
    question: "Who am I?",
    clues: [
      "I was born Creighton Chaney in Oklahoma City in 1906.",
      "I played Lennie in the 1939 film of Of Mice and Men.",
      "My father was the silent-film star known as ‘The Man of a Thousand Faces’.",
      "I played Larry Talbot, the title character in Universal's The Wolf Man (1941)."
    ],
    answer: "Lon Chaney Jr.",
    acceptAlso: ["Creighton Chaney"],
    explanation: "He played the Wolf Man, Frankenstein's Monster, the Mummy and the title role in Son of Dracula (1943) for Universal. (Plain ‘Lon Chaney’ was his father, so it is the host's call.)"
  },
  {
    id: "wa-10", round: "whoami", difficulty: "hard",
    question: "Who am I?",
    clues: [
      "I was born in Kenley, Surrey, in 1913.",
      "I played Doctor Who in two 1960s cinema films about the Daleks.",
      "I played Grand Moff Tarkin in Star Wars (1977).",
      "In Hammer horror films I played both Baron Frankenstein and Van Helsing."
    ],
    answer: "Peter Cushing",
    acceptAlso: ["Cushing"],
    explanation: "Cushing and Christopher Lee appeared together in more than 20 films and were close friends throughout their lives."
  }
];
