export const TEMPLATES_COURRIERS: Record<string, { label: string; objet: string; corps: string }> = {
  dapt: {
    label: "DAPT",
    objet: "Depassement d'Accostage Previsionnel des Travaux — {{numeroAffaire}}",
    corps: `Madame, Monsieur,

Dans le cadre du Marche cite en references, nous vous avons alerte le {{dateAlerte}} du depassement de l'accostage previsionnel initial fixe au {{dateAccostage}}.

A ce jour, le retard cumule s'eleve a {{dureeRetard}} jours calendaires, portant la nouvelle date previsionnelle d'accostage au {{nouvelleDateAccostage}}.

**Causes identifiees :**
- {{cause1}}
- {{cause2}}

**Incidences sur le planning general :**
Le depassement de l'accostage previsionnel entraine un decalage des phases suivantes :
- Phase de verification : report de {{dureeReport}} jours
- Mise en service previsionnelle : nouveau jalon au {{dateMiseEnService}}

**Mesures correctives engagees :**
Afin de limiter l'impact de ce retard, les dispositions suivantes ont ete mises en oeuvre :
- {{mesure1}}
- {{mesure2}}

Nous vous tiendrons informes de l'evolution de la situation et restons a votre disposition pour tout complement d'information.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.`,
  },
  mise_en_demeure: {
    label: "Mise en demeure",
    objet: "Mise en demeure — {{objet}} — {{numeroAffaire}}",
    corps: `Madame, Monsieur,

Par la presente, et en application des stipulations du Marche n° {{numeroAffaire}}, nous vous mettons formellement en demeure de proceder a {{objetMiseEnDemeure}} dans un delai de {{delaiJours}} jours calendaires a compter de la reception du present courrier.

**Rappel des faits :**
{{rappelFaits}}

**Obligations contractuelles :**
Conformement a l'article {{articleMarche}} du Marche, vous etes tenu de {{obligation}}.

**Consequences en cas de non-execution :**
A defaut de regularisation dans le delai imparti, nous nous reservons le droit de :
- Appliquer les penalites de retard prevues au marche, soit {{montantPenalites}} euros par jour de retard
- Proceder a l'execution des prestations aux frais et risques de votre entreprise
- Engager toute procedure contentieuse utile

Nous vous rappelons que le present courrier constitue une mise en demeure au sens des articles du Code civil et du CCAG applicable au marche.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.`,
  },
  alerte: {
    label: "Courrier d'alerte",
    objet: "Alerte — {{objet}} — Chantier {{nomChantier}}",
    corps: `Madame, Monsieur,

Par la presente, nous souhaitons vous alerter sur la situation suivante constatee dans le cadre du chantier {{nomChantier}}, Marche n° {{numeroAffaire}}.

**Nature de l'alerte :**
{{descriptionAlerte}}

**Date de constatation :** {{dateConstatation}}

**Impacts potentiels :**
- Sur les delais : {{impactDelais}}
- Sur les couts : {{impactCouts}}
- Sur la securite : {{impactSecurite}}
- Sur la qualite : {{impactQualite}}

**Elements de contexte :**
{{contexte}}

**Actions recommandees :**
Afin de prevenir toute aggravation de la situation, nous preconisons les mesures suivantes :
1. {{action1}}
2. {{action2}}
3. {{action3}}

Nous attirons votre attention sur le caractere urgent de cette situation et vous demandons de bien vouloir prendre les dispositions necessaires dans les meilleurs delais.

Nous restons a votre entiere disposition pour examiner ensemble les solutions a mettre en oeuvre.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.`,
  },
  reserve: {
    label: "Courrier de reserve",
    objet: "Reserves — {{objet}} — {{numeroAffaire}}",
    corps: `Madame, Monsieur,

A la suite de {{evenement}} du {{date}}, et conformement aux dispositions contractuelles du Marche n° {{numeroAffaire}}, nous emettons les reserves suivantes :

**Reserve n°1 — {{titreReserve1}}**
Description : {{descriptionReserve1}}
Localisation : {{localisationReserve1}}
Impact : {{impactReserve1}}

**Reserve n°2 — {{titreReserve2}}**
Description : {{descriptionReserve2}}
Localisation : {{localisationReserve2}}
Impact : {{impactReserve2}}

**Conditions de levee des reserves :**
Les reserves ci-dessus seront levees sous reserve de la realisation des actions correctives suivantes :
- {{actionCorrective1}}
- {{actionCorrective2}}

**Delai de reprise :**
Nous vous demandons de proceder aux reprises necessaires dans un delai de {{delaiReprise}} jours calendaires a compter de la notification du present courrier.

A defaut de regularisation dans le delai imparti, nous nous reservons le droit d'appliquer les dispositions prevues au marche.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.`,
  },
  amiante: {
    label: "Demande rapports amiante",
    objet: "Demande de transmission des rapports amiante — {{nomChantier}}",
    corps: `Madame, Monsieur,

Conformement a la reglementation en vigueur, et notamment au Code du travail (articles R. 4412-94 et suivants) ainsi qu'au decret n° 2012-639 du 4 mai 2012 relatif aux risques d'exposition a l'amiante, nous vous demandons de bien vouloir nous transmettre dans les meilleurs delais les documents suivants :

1. **Reperage amiante avant travaux (RAT)**
   Rapport de reperage realise par un operateur de diagnostic certifie, incluant la localisation precise des materiaux et produits contenant de l'amiante (MPCA).

2. **Rapports de prelevements et analyses**
   Resultats des analyses effectuees par un laboratoire accredite COFRAC, incluant les mesures d'empoussierement.

3. **Plan de retrait / Mode operatoire**
   Document detaillant les procedures de retrait ou d'encapsulage prevues, valide par l'organisme certifie.

4. **Fiches d'exposition du personnel**
   Attestations d'exposition pour l'ensemble du personnel intervenant sur les zones concernees.

5. **Bordereau de suivi des dechets d'amiante (BSDA)**
   Justificatifs de l'elimination des dechets amiantiferes dans une installation de stockage de dechets dangereux (ISDD).

Ces documents sont indispensables a la poursuite des travaux dans le respect des obligations de securite. Tout retard dans leur transmission est susceptible d'entrainer un arret des travaux sur les zones concernees.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.`,
  },
  devoir_conseil: {
    label: "Devoir de conseil",
    objet: "Devoir de conseil — {{objet}} — {{nomChantier}}",
    corps: `Madame, Monsieur,

Au titre de notre devoir de conseil et conformement aux obligations qui nous incombent dans le cadre du Marche n° {{numeroAffaire}} relatif au chantier {{nomChantier}}, nous portons a votre connaissance les elements suivants :

**Risques identifies :**
1. {{risque1}}
   - Probabilite : {{probabilite1}}
   - Gravite : {{gravite1}}
2. {{risque2}}
   - Probabilite : {{probabilite2}}
   - Gravite : {{gravite2}}

**Analyse technique :**
{{analyseDetails}}

**Recommandations :**
Au regard des risques identifies ci-dessus, nous vous recommandons de :
1. {{recommandation1}}
2. {{recommandation2}}
3. {{recommandation3}}

**Consequences en l'absence de mesures :**
En l'absence de prise en compte des recommandations formulees ci-dessus, les consequences suivantes sont a anticiper :
- {{consequence1}}
- {{consequence2}}

Nous attirons votre attention sur le fait que le present courrier vaut information prealable au titre de notre obligation de conseil. Nous vous invitons a nous faire part de votre decision dans un delai de {{delaiReponse}} jours.

Nous restons a votre disposition pour tout complement d'information ou pour organiser une reunion technique sur le sujet.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.`,
  },
}
