// Run with: npx ts-node --esm src/seed.ts
// Or add to package.json: "seed": "ts-node --esm src/seed.ts"
//
// This script connects directly to the database using your
// DATABASE_URL and inserts all the data for Case 1.

import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // load .env

const db = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // tables already exist
});

async function seed() {
  await db.initialize();
  console.log('Connected to database');

  // ─── Clear existing data (order matters for foreign keys) ───
  await db.query('DELETE FROM audio');
  await db.query('DELETE FROM scripted_events');
  await db.query('DELETE FROM game_states');
  await db.query('DELETE FROM evidence_connections');
  await db.query('DELETE FROM dialogue_nodes');
  await db.query('DELETE FROM clues');
  await db.query('DELETE FROM scene_connections');
  await db.query('DELETE FROM scenes');
  await db.query('DELETE FROM suspects');
  await db.query('DELETE FROM cases');
  console.log('Cleared old data');

  // ═══════════════════════════════════════════════════════════
  // CASE
  // ═══════════════════════════════════════════════════════════
  const [caseRow] = await db.query(
    `INSERT INTO cases (title, setting, time_period, style_theme, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [
      'The Last Note',
      'Speakeasy jazz club',
      'Late 1920s — Prohibition era',
      'noir',
      'A singer is found dead in her dressing room on a rainy night. ' +
        'The club is locked down, the heat is rising, and everyone has ' +
        'something to hide. Solve the murder before you become the ' +
        'prime suspect.',
    ],
  );
  const caseId = caseRow.id;
  console.log(`Case created: ${caseId}`);

  // ═══════════════════════════════════════════════════════════
  // SCENES
  // ═══════════════════════════════════════════════════════════
  const scenes: Record<string, string> = {};

  const sceneData = [
    // ── Act 1: Inside the club ──
    {
      key: 'main_bar',
      name: 'Main Bar',
      description:
        'The heart of the club. A long wooden bar, tables scattered across the floor, a small stage where the singer performed hours ago. The air is thick with cigarette smoke and rising heat.',
      type: 'internal',
      is_locked: false,
      total_clues: 3,
    },
    {
      key: 'owners_office',
      name: "Owner's Office",
      description:
        'A cluttered office behind the bar. Ledgers, receipts, and a framed staff photo on the wall. The desk has seen better days.',
      type: 'internal',
      is_locked: false,
      total_clues: 3,
    },
    {
      key: 'back_hallway',
      name: 'Back Hallway',
      description:
        'A narrow corridor connecting the bar to the back rooms. The wallpaper is peeling, the single bulb flickers. Doors lead to the bathrooms, basement, and dressing room.',
      type: 'internal',
      is_locked: false,
      total_clues: 1,
    },
    {
      key: 'dressing_room',
      name: 'Dressing Room',
      description:
        'The crime scene. A small room with a vanity mirror, costumes on a rack, and the body of Clara Byrne face-down on the floor. No external door — only the hallway entrance.',
      type: 'internal',
      is_locked: false,
      total_clues: 6,
    },
    {
      key: 'bathrooms',
      name: 'Bathrooms',
      description:
        'Cramped restrooms near the basement door. Noticeably warmer here than the rest of the building.',
      type: 'internal',
      is_locked: false,
      total_clues: 1,
    },
    {
      key: 'basement',
      name: 'Basement',
      description:
        'A heavy locked door radiating heat. The owner says the key is lost.',
      type: 'internal',
      is_locked: true,
      unlock_clue_id: null, // unlocked in Act 4 via story
      total_clues: 2,
    },
    {
      key: 'trash_area',
      name: 'Trash Area',
      description:
        'The right side of the building exterior. Trash bins, a broken outdoor lamp with exposed wiring, rain pooling on the ground.',
      type: 'internal',
      is_locked: false,
      total_clues: 3,
    },
    {
      key: 'back_alley',
      name: 'Back Alley',
      description:
        'The left side entrance. A narrow alley with puddles and a single door back into the building. Far from the dressing room.',
      type: 'internal',
      is_locked: false,
      total_clues: 1,
    },
    // ── Act 2: External locations ──
    {
      key: 'singers_apartment',
      name: "Singer's Apartment",
      description:
        "Clara's modest apartment. Cold — the heater has been broken for weeks. A neatly made bed, a small bathroom, personal effects.",
      type: 'external',
      is_locked: true,
      total_clues: 3,
    },
    {
      key: 'butchers_home',
      name: "Butcher's Home",
      description:
        "The Mott residence. A tense household. Harold's work clothes in the laundry, Agnes's things meticulously organized.",
      type: 'external',
      is_locked: true,
      total_clues: 3,
    },
    {
      key: 'detectives_office',
      name: "Detective's Office",
      description:
        'Your office. A desk, a filing cabinet, a bottle of whiskey. The operator message that brought you to the club tonight is on the desk.',
      type: 'external',
      is_locked: true,
      total_clues: 1,
    },
  ];

  for (const s of sceneData) {
    const [row] = await db.query(
      `INSERT INTO scenes (case_id, name, description, type, is_locked, unlock_clue_id, total_clues)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        caseId,
        s.name,
        s.description,
        s.type,
        s.is_locked,
        s.unlock_clue_id ?? null,
        s.total_clues,
      ],
    );
    scenes[s.key] = row.id;
  }
  console.log(`Scenes created: ${Object.keys(scenes).length}`);

  // ═══════════════════════════════════════════════════════════
  // SCENE CONNECTIONS (two rows per bidirectional link)
  // ═══════════════════════════════════════════════════════════
  const connections = [
    // Main bar hub
    { from: 'main_bar', to: 'owners_office', label: "Owner's Office" },
    { from: 'main_bar', to: 'back_hallway', label: 'Back Hallway' },
    // Back hallway branches
    { from: 'back_hallway', to: 'dressing_room', label: 'Dressing Room' },
    { from: 'back_hallway', to: 'bathrooms', label: 'Bathrooms' },
    {
      from: 'back_hallway',
      to: 'basement',
      label: 'Basement',
      is_locked: true,
    },
    // Exterior access
    { from: 'back_hallway', to: 'back_alley', label: 'Back Alley Exit' },
    { from: 'dressing_room', to: 'trash_area', label: 'Trash Area (outside)' },
  ];

  for (const c of connections) {
    // Forward
    await db.query(
      `INSERT INTO scene_connections (scene_id_from, scene_id_to, label, is_locked)
       VALUES ($1, $2, $3, $4)`,
      [scenes[c.from], scenes[c.to], c.label, c.is_locked ?? false],
    );
    // Reverse
    await db.query(
      `INSERT INTO scene_connections (scene_id_from, scene_id_to, label, is_locked)
       VALUES ($1, $2, $3, $4)`,
      [
        scenes[c.to],
        scenes[c.from],
        c.label.replace('Exit', 'Entrance'),
        c.is_locked ?? false,
      ],
    );
  }
  console.log(`Scene connections created: ${connections.length * 2}`);

  // ═══════════════════════════════════════════════════════════
  // SUSPECTS
  // ═══════════════════════════════════════════════════════════
  const suspects: Record<string, string> = {};

  const suspectData = [
    {
      key: 'agnes',
      name: 'Agnes Mott',
      role: 'Cleaner',
      description:
        'The club cleaner. Married to Harold. Quiet, closed-off posture, heavy makeup. Refuses to remove her coat despite the heat.',
      is_guilty: true,
      location_during_crime:
        'Claims she was taking out the trash on the right side of the building.',
      stated_alibi:
        'Was outside emptying the trash bins when the lights went out. Came back in through the back alley entrance on the left.',
    },
    {
      key: 'harold',
      name: 'Harold Mott',
      role: 'Butcher',
      description:
        'Local butcher. Married to Agnes. Large, imposing man. Blood on his clothes and scratch marks on his back. Smells unusually clean for his profession.',
      is_guilty: false,
      location_during_crime:
        'Arrived at the club after closing to pick up his wife. Was in the main bar area when the lights went out.',
      stated_alibi:
        'Was at the bar waiting for Agnes to finish cleaning. Bartender and owner can confirm.',
    },
    {
      key: 'walter',
      name: 'Walter Goss',
      role: 'Club Owner',
      description:
        'Owns the speakeasy. Nervous, deflects questions about the basement. Complains about the heater constantly.',
      is_guilty: false,
      location_during_crime: "In his office counting the night's earnings.",
      stated_alibi:
        'Was in the office with the door open. Heard the bartender scream.',
    },
    {
      key: 'tom',
      name: 'Tom Webber',
      role: 'Bartender',
      description:
        'The bartender. Calm and practiced. Volunteers information about the butcher a little too eagerly.',
      is_guilty: false,
      location_during_crime: 'Behind the bar cleaning up after closing.',
      stated_alibi:
        'Was cleaning glasses when the lights went out. Went to fix the fuse and found the body.',
    },
    {
      key: 'haggerty',
      name: 'Detective Haggerty',
      role: 'Police Detective',
      description:
        'The cop assigned to the case. Corrupt, lazy, and not interested in looking too hard for the truth.',
      is_guilty: false,
      location_during_crime: 'Not at the club — arrives later with the police.',
      stated_alibi: 'N/A',
    },
  ];

  for (const s of suspectData) {
    const [row] = await db.query(
      `INSERT INTO suspects (case_id, name, role, description, is_guilty, location_during_crime, stated_alibi)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        caseId,
        s.name,
        s.role,
        s.description,
        s.is_guilty,
        s.location_during_crime,
        s.stated_alibi,
      ],
    );
    suspects[s.key] = row.id;
  }
  console.log(`Suspects created: ${Object.keys(suspects).length}`);

  // ═══════════════════════════════════════════════════════════
  // CLUES
  // ═══════════════════════════════════════════════════════════
  const clues: Record<string, string> = {};

  // ========================
  // The shape of one clue in the seed.
  // ? = optional, not every clue has it
  // ========================
  type ClueSeed = {
    key: string; // short name we use inside this file
    name: string;
    description: string;
    detail_text?: string;
    scene?: string; // scene key, like 'dressing_room'
    suspect?: string; // suspect key, like 'tom'
    required_clue?: string; // clue key that must be found first
    type: string;

    // ---- Inspection image ----
    x?: number;
    y?: number;
    inspect_type?: string; // 'model' | 'letter' | 'image'
    inspect_url?: string;
  };

  const clueData: ClueSeed[] = [
    // ── Dressing room (crime scene) ──
    {
      key: 'body_position',
      name: 'Body Position',
      description: 'Clara is face-down on the floor. Shot in the back.',
      detail_text:
        'She never saw it coming. Whoever did this was behind her — she was facing away, searching for something.',
      scene: 'dressing_room',
      type: 'observation',
    },
    {
      key: 'four_fingers',
      name: 'Four Fingers',
      description:
        'The victim has only four fingers on her left hand. Born with it.',
      detail_text:
        "Four fingers. That explains the scratch marks — if we find them on anyone, they'll be distinctive.",
      scene: 'dressing_room',
      type: 'physical',
    },
    {
      key: 'entry_wound',
      name: 'Entry Wound',
      description:
        'Clean, precise entry wound in the back. Fired from close range with a small-caliber weapon.',
      detail_text:
        'A .32, maybe. Quiet enough that nobody in the bar heard it. And precise — whoever pulled the trigger could see exactly what they were doing.',
      scene: 'dressing_room',
      type: 'physical',
    },
    {
      key: 'murder_weapon',
      name: 'Murder Weapon',
      description:
        'A .32 caliber snub-nose revolver on the floor near the body.',
      detail_text:
        "Small, compact, quiet. The kind of gun someone carries when they don't want people to know they're carrying.",
      scene: 'dressing_room',
      type: 'physical',
    },
    {
      key: 'missing_bracelet',
      name: 'Missing Bracelet',
      description:
        "A tan line on Clara's left wrist where a bracelet should be. She never took it off.",
      detail_text:
        'Tan line but no bracelet. She wore it every day — birthday gift from her mother. So where is it now?',
      scene: 'dressing_room',
      type: 'observation',
      required_clue: 'staff_photo',
    },
    {
      key: 'club_key',
      name: 'Club Key',
      description:
        "A key found on the victim's body. The owner says he never gave her one.",
      detail_text:
        'She had a key to the club. The owner looks surprised — or is it angry?',
      scene: 'dressing_room',
      type: 'physical',
    },
    // ── Owner's office ──
    {
      key: 'staff_photo',
      name: 'Staff Photo',
      description:
        'A dusty framed photo on the wall. After cleaning it, Clara is visible wearing a bracelet on her left wrist.',
      detail_text:
        'There she is, smiling. And on her wrist — a bracelet. I should check the body again.',
      scene: 'owners_office',
      type: 'document',
    },
    {
      key: 'salary_ledger',
      name: 'Salary Ledger',
      description:
        "The club's pay records. The bartender took a significant pay cut three months ago. The cleaner's pay stayed the same. The singer was on a low part-time salary — three nights a week.",
      detail_text:
        'Bartender got his pay slashed. Singer barely earning anything working three nights. But the cleaner — same rate as always. Interesting.',
      scene: 'owners_office',
      type: 'document',
    },
    {
      key: 'operator_message',
      name: 'Operator Message',
      description:
        "A note on the owner's desk: a phone message relayed through the operator, calling the detective to the club tonight. Anonymous. The club's phone number is on the message.",
      detail_text:
        'Someone called the operator from this club and asked them to reach me. Anonymous. Whoever did this wanted me here tonight.',
      scene: 'owners_office',
      type: 'document',
    },
    // ── Main bar ──
    {
      key: 'bartender_note',
      name: "Bartender's Note",
      description:
        'A folded note found near the singer\'s spot at the bar: "We need to talk about what happened. Please."',
      detail_text:
        'A note to Clara. No name, but the handwriting is shaky. Desperate. "What happened" — what happened between them?',
      scene: 'main_bar',
      type: 'document',
    },
    {
      key: 'butcher_coat',
      name: 'Bracelet in Coat',
      description:
        "Clara's bracelet found in the pocket of Harold Mott's coat hanging by the bar.",
      detail_text: "The bracelet. In the butcher's coat. How did it get there?",
      scene: 'main_bar',
      type: 'physical',
      required_clue: 'missing_bracelet',
    },
    {
      key: 'heater_running',
      name: 'Heater Always Running',
      description:
        "The heater is on full blast even though it's not cold outside. The owner says it's broken and can't be turned off.",
      detail_text:
        "Broken heater that only runs hot? Convenient excuse. Or maybe there's another reason this building needs to stay warm.",
      scene: 'main_bar',
      type: 'observation',
    },
    // ── Trash area ──
    {
      key: 'broken_lamp',
      name: 'Broken Outdoor Lamp',
      description:
        'An exterior lamp with wires exposed to the rain. This caused the short circuit that blew the fuse.',
      detail_text:
        "Exposed wires, rain, short circuit. Someone pried this open — this wasn't weather damage.",
      scene: 'trash_area',
      type: 'physical',
    },
    {
      key: 'full_trash_bins',
      name: 'Full Trash Bins',
      description:
        "The outdoor trash bins have fresh bags. But the indoor bins haven't been emptied.",
      detail_text:
        "She said she was taking out the trash. The outdoor bins are full — but the indoor bins haven't been touched. She brought trash out... but never collected it from inside first.",
      scene: 'trash_area',
      type: 'observation',
    },
    {
      key: 'right_side_door',
      name: 'Right Side Door',
      description:
        'The exterior door near the trash bins. It opens and closes fine.',
      detail_text:
        'Door works perfectly. So why did she walk all the way around to the other entrance in the rain?',
      scene: 'trash_area',
      type: 'observation',
    },
    // ── Bathrooms ──
    {
      key: 'heat_near_basement',
      name: 'Heat Near Basement',
      description:
        'The area near the basement door is noticeably warmer than the rest of the building.',
      detail_text:
        "It's even hotter here than the rest of this oven. Whatever's behind that basement door is generating serious heat.",
      scene: 'bathrooms',
      type: 'observation',
    },
    // ── Back hallway ──
    {
      key: 'no_dressing_room_exit',
      name: 'No External Door',
      description:
        'The dressing room has no external door. The only way in or out is through the hallway.',
      detail_text:
        'One way in, one way out. Whoever killed her had to come through this hallway.',
      scene: 'back_hallway',
      type: 'observation',
    },
    // ── Back alley ──
    {
      key: 'back_alley_entrance',
      name: 'Back Alley Entrance',
      description:
        'The left-side entrance to the building. Far from the dressing room and the trash area.',
      detail_text:
        "The back alley entrance. The cleaner says she came back in through here. But the trash is on the opposite side of the building. That's a long walk in the rain.",
      scene: 'back_alley',
      type: 'observation',
    },
    // ── Singer's apartment (Act 2) ──
    {
      key: 'broken_heater_apartment',
      name: 'Broken Apartment Heater',
      description:
        "The heater in Clara's apartment is broken. The apartment is freezing.",
      detail_text:
        "No heat. That's why she slept at the club. And that's how she found whatever's in that basement.",
      scene: 'singers_apartment',
      type: 'observation',
    },
    {
      key: 'matching_soap',
      name: 'Matching Soap',
      description:
        "A bar of lavender soap in Clara's bathroom. The same scent on the butcher.",
      detail_text:
        "Lavender. Same smell on the butcher. He wasn't just visiting — he was showering here.",
      scene: 'singers_apartment',
      type: 'physical',
    },
    {
      key: 'love_letters',
      name: 'Love Letters',
      description:
        "Letters from Harold to Clara. She clearly didn't know he was married.",
      detail_text:
        'Love letters. He signed them "yours only." She believed him. Poor girl didn\'t know the half of it.',
      scene: 'singers_apartment',
      type: 'document',
    },
    // ── Butcher's home (Act 2) ──
    {
      key: 'scratch_marks',
      name: 'Scratch Marks',
      description:
        "Fresh four-finger scratch marks on Harold's back. He claims they're from work.",
      detail_text:
        "Four fingers. Fresh scratches. From a woman born with four fingers on her left hand. These aren't from work.",
      scene: 'butchers_home',
      suspect: 'harold',
      type: 'physical',
    },
    {
      key: 'blood_on_clothes',
      name: 'Blood on Work Clothes',
      description:
        "Harold's work clothes have bloodstains. He says it's from butchering.",
      detail_text:
        "Blood on a butcher's clothes. Could be innocent. Could be everything.",
      scene: 'butchers_home',
      suspect: 'harold',
      type: 'physical',
    },
    {
      key: 'shrunken_clothes',
      name: 'Shrunken Clothes',
      description:
        "Some of Harold's clothes are noticeably shrunken. Neglect, not sabotage.",
      detail_text:
        "His shirts are two sizes too small. Nobody's taking care of his things at home — or nobody cares to.",
      scene: 'butchers_home',
      type: 'observation',
    },
    // ── Detective's office (Act 4) ──
    {
      key: 'timestamped_message',
      name: 'Timestamped Operator Message',
      description:
        'The original operator message that brought you to the club. Timestamped before the murder — proves someone lured you there.',
      detail_text:
        'The message came in before she was killed. Someone planned this. Someone wanted me at that club tonight — and I walked right into it.',
      scene: 'detectives_office',
      type: 'document',
    },
    // ── Basement (Act 4) ──
    {
      key: 'illegal_still',
      name: 'Illegal Still',
      description:
        'A full distillery operation hidden in the basement. This is what the owner was hiding — and what the singer discovered.',
      detail_text:
        "A still. That explains the heat, the locked door, the nervous owner. Clara found this — and that's why she had leverage over him.",
      scene: 'basement',
      type: 'physical',
    },
    {
      key: 'fuse_box',
      name: 'Fuse Box',
      description:
        "The building's fuse box. The blown fuse is on the back/outside circuit — the area only the cleaner uses.",
      detail_text:
        'The fuse that blew is for the back exterior. The lamp, the trash area. Only one person goes out there regularly.',
      scene: 'basement',
      type: 'physical',
    },
    // ── Suspect-linked clues (no specific scene) ──
    {
      key: 'wife_heavy_makeup',
      name: 'Heavy Makeup',
      description:
        'Agnes wears unusually heavy makeup. Layered, as if covering something underneath.',
      detail_text:
        "That's a lot of makeup for a cleaning shift. Layered thick — covering something, or covering for someone.",
      scene: 'main_bar',
      suspect: 'agnes',
      type: 'observation',
    },
    {
      key: 'wife_keeps_coat',
      name: 'Refuses to Remove Coat',
      description:
        'Agnes refuses to take off her coat despite the oppressive heat. Everyone else is sweating.',
      detail_text:
        "It must be ninety degrees in here and she won't take off her coat. What is she hiding under there?",
      scene: 'main_bar',
      suspect: 'agnes',
      type: 'observation',
    },
    {
      key: 'no_leak',
      name: 'No Leak in Dressing Room',
      description:
        'Agnes mentioned a leak in the dressing room. There is no leak.',
      detail_text:
        'I checked every inch of that dressing room. No leak. She lied. If she lied about that, what else?',
      scene: 'dressing_room',
      suspect: 'agnes',
      type: 'observation',
      required_clue: 'wife_lie_about_leak',
    },
  ];

  for (const c of clueData) {
    const [row] = await db.query(
      `INSERT INTO clues (case_id, name, description, detail_text, scene_id, suspect_id, required_clue_id, type,
                          x, y, inspect_type, inspect_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        // ---- Basic info ----
        caseId,
        c.name,
        c.description,
        c.detail_text ?? null,

        // ---- Links to other tables ----
        c.scene ? scenes[c.scene] : null,
        c.suspect ? suspects[c.suspect] : null,
        null, // we'll wire required_clue_id in a second pass
        c.type,

        // ---- Inspection image ----
        // Place on the image (percent), and what the popup shows.
        // Clues without these save null.
        c.x ?? null,
        c.y ?? null,
        c.inspect_type ?? null,
        c.inspect_url ?? null,
      ],
    );
    clues[c.key] = row.id;
  }

  // Second pass: wire up required_clue_id dependencies
  const dependencies: Record<string, string> = {
    missing_bracelet: 'staff_photo', // need to see staff photo first
    butcher_coat: 'missing_bracelet', // need to notice bracelet is missing first
    // no_leak requires a dialogue clue we'll add later
  };

  for (const [clueKey, requiredKey] of Object.entries(dependencies)) {
    if (clues[clueKey] && clues[requiredKey]) {
      await db.query('UPDATE clues SET required_clue_id = $1 WHERE id = $2', [
        clues[requiredKey],
        clues[clueKey],
      ]);
    }
  }

  console.log(`Clues created: ${Object.keys(clues).length}`);

  // ═══════════════════════════════════════════════════════════
  // EVIDENCE CONNECTIONS (key deductions)
  // ═══════════════════════════════════════════════════════════
  const evidenceConnections = [
    {
      clue1: 'entry_wound',
      clue2: 'broken_lamp',
      is_valid: true,
      realization:
        'The entry wound is precise — the killer could see. But the lights were out. Unless... the murder happened BEFORE the blackout.',
    },
    {
      clue1: 'full_trash_bins',
      clue2: 'back_alley_entrance',
      is_valid: true,
      realization:
        'She dumped trash on the right side but came back in on the left. She walked around the entire building. Why — unless she needed to be seen entering from the far side?',
    },
    {
      clue1: 'matching_soap',
      clue2: 'scratch_marks',
      is_valid: true,
      realization:
        'The soap links him to her apartment. The scratches are from her — four fingers. He was having an affair with Clara.',
    },
    {
      clue1: 'four_fingers',
      clue2: 'scratch_marks',
      is_valid: true,
      realization:
        "Four-finger scratches. Only one person in this case has four fingers. Clara scratched him — but this wasn't a struggle. These are on his back.",
    },
    {
      clue1: 'club_key',
      clue2: 'broken_heater_apartment',
      is_valid: true,
      realization:
        "Her apartment has no heat. Someone gave her a key to sleep at the club. That's how she discovered what's in the basement.",
    },
    {
      clue1: 'heater_running',
      clue2: 'heat_near_basement',
      is_valid: true,
      realization:
        'The heater masks the heat from the basement. Turn it off and anyone walking to the bathroom would feel it. The owner is hiding something down there.',
    },
    {
      clue1: 'operator_message',
      clue2: 'timestamped_message',
      is_valid: true,
      realization:
        "The call came from the club's phone, during the cleaner's shift, hours before the murder. She lured me here. This was planned.",
    },
    {
      clue1: 'wife_keeps_coat',
      clue2: 'wife_heavy_makeup',
      is_valid: true,
      realization:
        "The coat, the makeup — she's covering bruises. Someone has been hurting her.",
    },
  ];

  for (const ec of evidenceConnections) {
    await db.query(
      `INSERT INTO evidence_connections (case_id, clue_id_1, clue_id_2, is_valid, realization_text)
       VALUES ($1, $2, $3, $4, $5)`,
      [caseId, clues[ec.clue1], clues[ec.clue2], ec.is_valid, ec.realization],
    );
  }
  console.log(`Evidence connections created: ${evidenceConnections.length}`);

  // ═══════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════
  console.log('\n✅ Seed complete!');
  console.log(`   Case ID: ${caseId}`);
  console.log(`   Scenes: ${Object.keys(scenes).length}`);
  console.log(`   Suspects: ${Object.keys(suspects).length}`);
  console.log(`   Clues: ${Object.keys(clues).length}`);
  console.log(`   Evidence connections: ${evidenceConnections.length}`);
  console.log('\n   Save this case ID — your frontend will need it.');

  await db.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
