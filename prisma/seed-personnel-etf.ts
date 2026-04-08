import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const personnelsETF = [
  { prenom: "Zahir", nom: "ADAM HASSAN", poste: "Poseur" },
  { prenom: "Aurélien", nom: "ALLAIN", poste: "Chef de machine", telephone: "07 61 85 60 57" },
  { prenom: "Frédéric", nom: "ALLEZARD", poste: "Conducteur d'engins", telephone: "07 64 42 16 46" },
  { prenom: "Quentin", nom: "ANTOINE", poste: "Conducteur d'engins", telephone: "07 63 65 84 17" },
  { prenom: "Hadiya", nom: "BA", poste: "Poseur" },
  { prenom: "Hachim", nom: "BARRI", poste: "Technicien de chantier", telephone: "06 65 33 08 40" },
  { prenom: "Salahdine", nom: "BARRI", poste: "Poseur", telephone: "07 60 60 07 48" },
  { prenom: "Benjamin", nom: "BASCOU", poste: "Chef de chantier", telephone: "06 32 64 81 15" },
  { prenom: "Mathilde", nom: "BASTE", poste: "Conducteur de travaux", telephone: "02 40 95 73 50" },
  { prenom: "John", nom: "BATTY", poste: "Poseur" },
  { prenom: "Vincent", nom: "BERTONECHE", poste: "Conducteur d'engins", telephone: "07 64 50 65 63" },
  { prenom: "Mathieu", nom: "BOIRON", poste: "Ouvrier maintenance", telephone: "02 40 95 73 50" },
  { prenom: "Julien", nom: "BOISSINOT", poste: "Aide conducteur de travaux", telephone: "07 60 73 31 15" },
  { prenom: "Arnaud", nom: "BOISTEAU", poste: "Poseur" },
  { prenom: "Yohan", nom: "BONNEL", poste: "Chef d'équipe", telephone: "06 84 64 05 00" },
  { prenom: "Radouan", nom: "BOUNOUAR", poste: "Chef de machine", telephone: "06 60 24 45 53" },
  { prenom: "Miloud", nom: "BOUTIT", poste: "Conducteur d'engins" },
  { prenom: "Pierre", nom: "BRAUD", poste: "Alternant conducteur travaux", telephone: "02 40 95 73 50" },
  { prenom: "Guy", nom: "CALLU", poste: "Poseur" },
  { prenom: "Jérémy", nom: "CATTEAU", poste: "Chef d'équipe", telephone: "06 65 33 14 48" },
  { prenom: "Alexis", nom: "CAUQUI", poste: "Conducteur d'engins", telephone: "06 61 40 64 64" },
  { prenom: "Jordan", nom: "CAUQUI", poste: "Conducteur d'engins" },
  { prenom: "Cédric", nom: "CHAUBET", poste: "Conducteur d'engins", telephone: "06 76 77 82 43" },
  { prenom: "Loic", nom: "CHAUVEL", poste: "Contrôleur qualité", telephone: "06 58 78 95 55" },
  { prenom: "Lamine", nom: "COLY", poste: "Soudeur" },
  { prenom: "Lionel-Xavier", nom: "CORNU", poste: "Conducteur d'engins", telephone: "06 12 81 72 98" },
  { prenom: "Bruno", nom: "COURTIEN", poste: "Poseur" },
  { prenom: "Rui", nom: "DA CONCEICAO MEIRELES", poste: "Poseur" },
  { prenom: "Guillemette", nom: "DE CHARRY", poste: "Ass. Admin", telephone: "02 40 95 73 51" },
  { prenom: "Jean Luc", nom: "DELAHAYE", poste: "Chef d'équipe" },
  { prenom: "Jean Philippe", nom: "DUCOS", poste: "Poseur Conducteur d'engins" },
  { prenom: "Faycal", nom: "EL BISSIS", poste: "Poseur" },
  { prenom: "Damien", nom: "FANTOU", poste: "Chef Atelier", telephone: "02 40 95 73 50" },
  { prenom: "Sébastien", nom: "FOSSE", poste: "Aide conducteur de travaux", telephone: "06 88 43 26 19" },
  { prenom: "Patrice", nom: "FOULONNEAU", poste: "Soudeur Poseur", telephone: "06 86 17 36 14" },
  { prenom: "Loic", nom: "FREVILLE", poste: "Soudeur", telephone: "07 61 36 81 16" },
  { prenom: "Mostafa", nom: "FTICH SAMADI", poste: "Poseur", telephone: "06 25 50 73 17" },
  { prenom: "Patrick", nom: "GARGOT", poste: "Conducteur d'engins", telephone: "06 76 72 34 31" },
  { prenom: "Guillaume", nom: "GARREC", poste: "Chef de chantier", telephone: "06 84 04 89 41" },
  { prenom: "Lamine", nom: "GASSAMA", poste: "Poseur" },
  { prenom: "Mike", nom: "GAURY", poste: "Poseur" },
  { prenom: "Guy", nom: "GICQUEL", poste: "Poseur" },
  { prenom: "Lisa", nom: "GRIMBERGER", poste: "Alternante conducteur travaux", telephone: "02 40 95 73 50" },
  { prenom: "Manuel", nom: "GUISE", poste: "Chef d'équipe", telephone: "06 65 44 62 60" },
  { prenom: "Louis Marie", nom: "GUYADER", poste: "Chef Secteur Nantes", telephone: "02 40 95 73 52" },
  { prenom: "Imad", nom: "HAFFOUDI", poste: "Aide conducteur de travaux", telephone: "06 84 64 04 36" },
  { prenom: "Jamel", nom: "HAMDOUNE", poste: "Conducteur d'engins", telephone: "06 80 03 49 54" },
  { prenom: "Afif", nom: "HAMIDI", poste: "Poseur" },
  { prenom: "Mohamed", nom: "HARBI", poste: "Chef d'équipe", telephone: "06 65 83 46 55" },
  { prenom: "Royal", nom: "HASANOV", poste: "Alternant Chef de chantier", telephone: "07 60 87 22 01" },
  { prenom: "Lucas", nom: "HYVERNAUD", poste: "Contrôleur qualité", telephone: "06 99 01 62 98" },
  { prenom: "Mathieu", nom: "ILTIS", poste: "Chef d'équipe", telephone: "07 62 48 47 99" },
  { prenom: "Mickaël", nom: "ILTIS", poste: "Poseur" },
  { prenom: "Mathieu", nom: "LE CREN", poste: "Conducteur d'engins", telephone: "06 99 11 91 40" },
  { prenom: "Thierry", nom: "LE TONQUEZE", poste: "Conducteur de travaux", telephone: "02 40 95 73 50" },
  { prenom: "Anthony", nom: "LE VEU", poste: "Conducteur d'engins", telephone: "07 60 76 88 92" },
  { prenom: "Clément", nom: "LE VU", poste: "Chef d'équipe", telephone: "07 64 81 21 46" },
  { prenom: "Yanis", nom: "LEFEBVRE", poste: "Poseur", telephone: "06 59 99 35 78" },
  { prenom: "Sébastien", nom: "LESAGE", poste: "Chef de chantier", telephone: "06 16 34 52 67" },
  { prenom: "Agathe", nom: "LHOMMEAU", poste: "Chef de chantier", telephone: "07 63 98 39 52" },
  { prenom: "Jérémy", nom: "LOISON", poste: "Conducteur d'engins", telephone: "06 99 86 15 83" },
  { prenom: "Vincent", nom: "LOUBET", poste: "Conducteur de travaux", telephone: "05 54 49 02 30" },
  { prenom: "Miguel", nom: "LUBENI", poste: "Poseur" },
  { prenom: "Alexandre", nom: "MANTOIS", poste: "Contrôleur qualité", telephone: "06 58 75 09 45" },
  { prenom: "Sébastien", nom: "MANY", poste: "Poseur" },
  { prenom: "Manuel", nom: "MARINHO", poste: "Référent Machine", telephone: "06 65 44 63 51" },
  { prenom: "Mickaël", nom: "MATHURIN", poste: "Conducteur de travaux", telephone: "02 40 95 73 50" },
  { prenom: "Anselme", nom: "MEIRELES", poste: "Poseur" },
  { prenom: "Lucy", nom: "MONCERE", poste: "Alternante Cheffe de chantier", telephone: "06 59 99 30 02" },
  { prenom: "Alexandre", nom: "MOREL", poste: "Conducteur d'engins" },
  { prenom: "Laurent", nom: "MORICEAU", poste: "Conducteur d'engins", telephone: "06 80 02 35 84" },
  { prenom: "Mickaël", nom: "MORVAN", poste: "Conducteur d'engins" },
  { prenom: "Boniface", nom: "NDIYUNZE", poste: "Chef d'équipe", telephone: "06 62 19 02 56" },
  { prenom: "Julien", nom: "PAULAIS", poste: "Conducteur de travaux", telephone: "02 40 95 73 50" },
  { prenom: "Anthony", nom: "PAYS", poste: "Soudeur Poseur", telephone: "06 84 64 30 03" },
  { prenom: "Ludovic", nom: "PERRIN", poste: "Poseur" },
  { prenom: "Francis", nom: "PHILIPPE", poste: "Conducteur de travaux", telephone: "05 54 49 02 30" },
  { prenom: "Sylvain", nom: "POIRIER", poste: "Chef d'équipe", telephone: "06 74 40 36 23" },
  { prenom: "Lucien", nom: "QUINIO", poste: "Poseur" },
  { prenom: "Hugues", nom: "REMOULU", poste: "Mécanicien", telephone: "05 54 49 02 30" },
  { prenom: "Juan Carlos", nom: "RIFFO MORALES", poste: "Poseur" },
  { prenom: "Clarisse", nom: "ROLLAND", poste: "Conducteur de travaux", telephone: "02 40 95 73 50" },
  { prenom: "Margaux", nom: "ROLLAND", poste: "Conducteur de travaux", telephone: "05 54 49 02 30" },
  { prenom: "Anthony", nom: "SALZAT", poste: "Poseur" },
  { prenom: "Philippe", nom: "SAVARIEAU", poste: "Chef d'équipe", telephone: "06 86 56 84 02" },
  { prenom: "Stéphane", nom: "SCATTOLON", poste: "Conducteur d'engins", telephone: "06 30 67 92 17" },
  { prenom: "Patrice", nom: "SERAY", poste: "Chef d'équipe", telephone: "06 89 84 79 16" },
  { prenom: "Pierre Henry", nom: "SICARD", poste: "Conducteur d'engins" },
  { prenom: "Riad", nom: "SLAMA", poste: "Conducteur d'engins", telephone: "07 62 57 24 03" },
  { prenom: "Malick", nom: "SOW", poste: "Poseur", telephone: "06 62 17 68 23" },
  { prenom: "Said", nom: "TAHRI", poste: "Poseur" },
  { prenom: "Jonathan", nom: "TARRIERE", poste: "Poseur" },
  { prenom: "Julien", nom: "TAVERNIER", poste: "Chef d'équipe", telephone: "07 64 81 21 48" },
  { prenom: "Jean Baptiste", nom: "TOBIE", poste: "Conducteur d'engins", telephone: "06 09 74 13 57" },
  { prenom: "Anthony", nom: "TROHEL", poste: "Conducteur d'engins", telephone: "06 65 33 07 24" },
  { prenom: "Henri", nom: "TURPIN", poste: "Poseur" },
  { prenom: "Manon", nom: "VAILLANT", poste: "Contrôleur qualité", telephone: "07 60 60 05 08" },
  { prenom: "Stéphane", nom: "VERGNE", poste: "Poseur" },
  { prenom: "Jérôme", nom: "VILLAR", poste: "Chef de chantier", telephone: "06 72 86 15 16" },
  { prenom: "Nicolas", nom: "VRIGNEAU", poste: "Conducteur de travaux", telephone: "02 40 95 73 50" },
  { prenom: "Ighortta", nom: "ZIDANE", poste: "Poseur" },
  { prenom: "Laurent", nom: "ZULIANI", poste: "Chef d'équipe", telephone: "07 63 65 83 98" },
]

async function main() {
  console.log(`\n--- Seed Personnel ETF ---`)
  console.log(`Total à traiter : ${personnelsETF.length}\n`)

  // Récupérer tous les personnels existants pour vérifier les doublons
  const existants = await prisma.personnel.findMany({
    select: { prenom: true, nom: true },
  })

  const existantsSet = new Set(
    existants.map((p) => `${p.prenom.toLowerCase()}|${p.nom.toLowerCase()}`)
  )

  let crees = 0
  let ignores = 0

  for (const p of personnelsETF) {
    const cle = `${p.prenom.toLowerCase()}|${p.nom.toLowerCase()}`

    if (existantsSet.has(cle)) {
      console.log(`  DOUBLON ignoré : ${p.prenom} ${p.nom}`)
      ignores++
      continue
    }

    await prisma.personnel.create({
      data: {
        prenom: p.prenom,
        nom: p.nom,
        poste: p.poste,
        telephone: p.telephone ?? null,
        entreprise: "ETF",
      },
    })

    existantsSet.add(cle)
    crees++
  }

  console.log(`\n--- Résultat ---`)
  console.log(`  Créés   : ${crees}`)
  console.log(`  Ignorés : ${ignores}`)
  console.log(`  Total   : ${personnelsETF.length}\n`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
