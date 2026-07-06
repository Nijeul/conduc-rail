// Modèles de courriers contractuels — marchés de travaux ferroviaires (SNCF Réseau).
// Rédaction type "expert juridique marchés de travaux" :
// - visas contractuels précis (CCCG Travaux SNCF, Code civil, Code du travail)
// - réserves de droits systématiques
// - les mentions entre [crochets] sont à compléter par le rédacteur
// - {{nomChantier}}, {{numeroAffaire}}, {{date}}, {{dateDebut}} sont substitués automatiquement

export const TEMPLATES_COURRIERS: Record<string, { label: string; objet: string; corps: string }> = {
  alerte_masse: {
    label: 'Alerte dépassement de la masse des travaux (art. 15 CCCG)',
    objet: "Procédure d'alerte du dépassement de la masse des travaux",
    corps: `Madame, Monsieur,

Dans le cadre du marché cité en objet, relatif aux travaux de {{nomChantier}}, nous vous informons que l'exécution des prestations conduit à un dépassement de la masse initiale du marché, évaluée à [montant initial] euros HT.

Ce dépassement résulte notamment de la modification de certaines quantités marchées et de la réalisation de travaux supplémentaires demandés par la maîtrise d'œuvre, nécessaires à la bonne réalisation de l'opération et à la continuité du chantier, donnant lieu aux prix nouveaux n° [x] à [y] établis en cours d'exécution.

Ainsi, conformément à l'article 15.1 du CCCG Travaux, la masse des travaux du Marché, évaluée à partir des prix de base, des prix nouveaux, définitifs ou provisoires, est désormais portée à [nouveau montant] euros HT (dont le détail est annexé au présent courrier).

Conformément à l'article 15.2 du CCCG Travaux SNCF dans son édition du 05 février 2020, relatif à la procédure d'alerte lorsque la masse des travaux exécutés atteint la masse initiale, nous vous informons que cette masse initiale est d'ores et déjà atteinte et dépassée.

Afin de permettre la bonne exécution des travaux restants ainsi que la bonne planification des moyens alloués, et conformément aux dispositions précitées, nous vous prions de nous faire parvenir un ordre de service nous notifiant votre décision de poursuivre ces travaux, en indiquant le montant limite jusqu'où les travaux peuvent être poursuivis.

Dans l'attente de cet ordre de service, nous nous réservons le droit, conformément aux stipulations précitées, de suspendre l'exécution des prestations excédant la masse initiale, sans que cette suspension puisse nous être imputée à faute ni fonder l'application de pénalités.

Nous restons à votre disposition pour toute information complémentaire et vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  prix_nouveaux: {
    label: 'Travaux supplémentaires — demande de prix nouveaux (art. 14 CCCG)',
    objet: 'Travaux supplémentaires — notification de prix nouveaux',
    corps: `Madame, Monsieur,

Dans le cadre de l'exécution du marché cité en objet, la maîtrise d'œuvre nous a demandé de réaliser les prestations suivantes, non prévues au bordereau des prix du marché : [désignation précise des travaux supplémentaires, référence de la demande — OS, courriel, compte rendu de réunion du [date]].

Ces prestations, indispensables à la bonne réalisation de l'opération, ne correspondent à aucun prix du marché. En conséquence, et conformément à l'article 14 du CCCG Travaux SNCF relatif au règlement des ouvrages ou travaux non prévus, nous vous notifions les propositions de prix nouveaux ci-jointes :

- Prix nouveau n° [x] — [désignation] : [montant] euros HT ;
- Prix nouveau n° [y] — [désignation] : [montant] euros HT.

Le sous-détail de ces prix, établi à partir des conditions économiques de base du marché, est annexé au présent courrier.

Nous vous demandons de bien vouloir nous notifier ces prix par ordre de service. À défaut de notification de prix provisoires dans les délais prévus par les stipulations précitées, nous vous informons que les prestations concernées seront réglées sur la base des prix proposés ci-dessus, que nous nous réservons le droit de faire valoir dans le décompte.

Nous attirons par ailleurs votre attention sur le fait que la réalisation de ces travaux supplémentaires est susceptible d'avoir une incidence sur le délai d'exécution, incidence sur laquelle nous formulons toutes réserves.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  prolongation_delai: {
    label: "Demande de prolongation du délai d'exécution (art. 19 CCCG)",
    objet: "Demande de prolongation du délai d'exécution des travaux",
    corps: `Madame, Monsieur,

Dans le cadre du marché cité en objet, nous avons été confrontés aux événements suivants, dont la survenance ne nous est pas imputable et qui ont affecté le déroulement des travaux :

1. [événement n° 1 — nature, date de survenance, durée d'impact] ;
2. [événement n° 2 — nature, date de survenance, durée d'impact].

Ces événements, dûment consignés [au journal de chantier / dans les comptes rendus de réunion de chantier / par constats contradictoires], ont eu pour effet de désorganiser l'exécution des prestations et d'en retarder l'avancement dans les conditions suivantes : [description synthétique de l'impact sur le planning].

En conséquence, et conformément à l'article 19 du CCCG Travaux SNCF relatif à la prolongation des délais d'exécution, nous sollicitons une prolongation du délai contractuel de [nombre] jours calendaires, portant la date d'achèvement des travaux au [nouvelle date].

Cette demande est formulée sous réserve de tous autres droits, et notamment de la réparation des préjudices subis du fait des événements précités (immobilisation de moyens, pertes de rendement, frais de maintien en place des installations), dont le chiffrage vous sera communiqué par mémoire séparé.

Nous vous prions de bien vouloir nous notifier votre décision par ordre de service et vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  reserves_os: {
    label: "Réserves sur ordre de service",
    objet: "Réserves sur l'ordre de service n° [x] du [date]",
    corps: `Madame, Monsieur,

Nous accusons réception de l'ordre de service n° [x] notifié le [date], nous prescrivant [objet de l'OS].

Conformément aux stipulations du CCCG Travaux SNCF relatives aux ordres de service, nous vous notifions, dans le délai contractuel, les réserves suivantes :

1. [Réserve n° 1 — exposé précis du motif : contradiction avec les stipulations du marché, incidence financière non couverte, impossibilité technique, délai insuffisant, etc.] ;
2. [Réserve n° 2 — exposé du motif].

En effet, [développement circonstancié : rappel des stipulations contractuelles concernées, des faits et des conséquences techniques et financières de l'ordre de service].

Conformément à nos obligations contractuelles, nous exécuterons les prescriptions de l'ordre de service précité. Toutefois, la présente notification de réserves préserve l'intégralité de nos droits, notamment quant à la rémunération des sujétions et prestations supplémentaires en résultant et quant à l'incidence sur les délais d'exécution, pour lesquelles nous établirons les demandes correspondantes.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  intemperies: {
    label: "Constat d'intempéries — arrêt de chantier",
    objet: "Constat d'intempéries et incidence sur le délai d'exécution",
    corps: `Madame, Monsieur,

Nous vous informons que les conditions météorologiques constatées sur le chantier {{nomChantier}} ont rendu impossible l'exécution des travaux dans les conditions suivantes :

- Période concernée : du [date] au [date], soit [nombre] journées ;
- Nature des intempéries : [pluie, vent, gel, neige, canicule — avec relevés] ;
- Postes de travaux affectés : [désignation des tâches arrêtées ou ralenties].

Les relevés de la station météorologique de [station de référence] établissant le dépassement des seuils contractuels sont annexés au présent courrier, et les arrêts correspondants ont été consignés au journal de chantier.

En conséquence, nous vous demandons de constater contradictoirement ces journées d'intempéries et de nous accorder, conformément aux stipulations du CCCG Travaux SNCF relatives à la prolongation des délais, une prolongation du délai d'exécution égale au nombre de journées d'arrêt constatées, soit [nombre] jours.

Nous formulons par ailleurs toutes réserves quant aux conséquences financières de ces arrêts (immobilisation du personnel et du matériel, frais de gardiennage et de maintien des installations de chantier), dont le chiffrage vous sera transmis le cas échéant.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  constat_contradictoire: {
    label: 'Demande de constat contradictoire',
    objet: 'Demande de constat contradictoire',
    corps: `Madame, Monsieur,

Dans le cadre de l'exécution du marché cité en objet, nous avons constaté la situation suivante : [description précise et factuelle de la situation à constater — état des lieux, sujétion imprévue, dommage, avancement des travaux, etc.], le [date], sur [localisation précise].

Cette situation étant susceptible d'avoir des incidences sur les conditions d'exécution du marché, tant techniques que financières, il importe qu'elle soit constatée contradictoirement sans délai, avant toute évolution ou disparition des éléments matériels concernés.

En conséquence, et conformément aux stipulations du CCCG Travaux SNCF relatives aux constats, nous vous demandons de bien vouloir organiser un constat contradictoire sur site dans les meilleurs délais, et vous proposons la date du [date] à [heure].

À défaut de réponse de votre part dans un délai de [huit] jours, ou en cas d'impossibilité de votre part de dépêcher un représentant, nous serons contraints de faire établir le constat par nos soins, le cas échéant par voie d'huissier, et nous nous réservons le droit d'en faire état dans toute procédure ultérieure.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  mise_en_demeure: {
    label: 'Mise en demeure',
    objet: 'Mise en demeure — [objet]',
    corps: `Madame, Monsieur,

Aux termes [du marché / de la commande / du contrat de sous-traitance] n° {{numeroAffaire}}, vous vous êtes engagés à [rappel précis de l'obligation : exécuter les prestations de..., livrer..., transmettre les documents..., régler la somme de...].

Or, nous constatons qu'à ce jour, et malgré [nos relances des [dates]], cette obligation demeure inexécutée : [exposé factuel et daté des manquements constatés].

En conséquence, et conformément aux articles 1217, 1231-1 et 1344 du Code civil, nous vous mettons en demeure de [obligation à exécuter, précisément décrite] dans un délai de [nombre] jours calendaires à compter de la réception de la présente.

À défaut d'exécution complète dans le délai imparti, nous nous réservons le droit, sans nouvel avis :

- d'appliquer les pénalités prévues [à l'article [x] du marché], arrêtées à ce jour à [montant] euros et continuant à courir ;
- de faire exécuter les prestations concernées par un tiers, à vos frais et risques ;
- de suspendre nos propres obligations corrélatives, par application de l'exception d'inexécution (article 1219 du Code civil) ;
- de résilier le contrat à vos torts exclusifs et de vous réclamer l'indemnisation de l'intégralité des préjudices subis.

La présente mise en demeure fait courir les intérêts moratoires et constitue le point de départ des délais contractuels et légaux. Elle ne vaut renonciation à aucun de nos droits et actions.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  memoire_reclamation: {
    label: 'Transmission de mémoire en réclamation (art. 50 CCCG)',
    objet: 'Mémoire en réclamation — demande de règlement',
    corps: `Madame, Monsieur,

Dans le cadre de l'exécution du marché cité en objet, notre entreprise a été confrontée à des événements et sujétions non prévus au marché qui ont bouleversé les conditions d'exécution des travaux et généré des coûts supplémentaires demeurés à notre charge.

Ces événements, portés à votre connaissance en cours d'exécution par nos courriers et réserves des [dates des courriers et réserves], sont pour l'essentiel les suivants :

1. [chef de réclamation n° 1 — exposé synthétique] ;
2. [chef de réclamation n° 2 — exposé synthétique].

En conséquence, et conformément à l'article 50 du CCCG Travaux SNCF relatif au règlement des différends, nous vous transmettons ci-joint notre mémoire en réclamation exposant, pour chaque chef de préjudice, les faits, leur imputabilité, les fondements contractuels de la demande ainsi que son chiffrage détaillé.

Le montant total de notre demande s'établit à [montant] euros HT, se décomposant comme suit :

- Chef n° 1 : [montant] euros HT ;
- Chef n° 2 : [montant] euros HT.

Nous vous demandons de bien vouloir nous notifier votre décision dans les délais prévus par les stipulations précitées. À défaut de réponse dans ces délais, ou en cas de rejet total ou partiel, nous nous réservons le droit de poursuivre le règlement du différend selon les voies prévues au marché.

La présente transmission interrompt, en tant que de besoin, tout délai de forclusion ou de prescription applicable à nos demandes.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  amiante: {
    label: 'Demande des rapports amiante (RAT)',
    objet: 'Demande de transmission du repérage amiante avant travaux',
    corps: `Madame, Monsieur,

En vue de l'exécution des travaux du chantier {{nomChantier}}, et en votre qualité de donneur d'ordre au sens des articles R. 4412-97 et suivants du Code du travail, nous vous demandons de bien vouloir nous transmettre, préalablement à toute intervention :

1. le rapport de repérage de l'amiante avant travaux (RAT), établi conformément à l'arrêté du 16 juillet 2019 par un opérateur de repérage certifié, couvrant l'intégralité des emprises et ouvrages concernés par nos travaux ;
2. les résultats des prélèvements et analyses réalisés par un laboratoire accrédité COFRAC ;
3. le cas échéant, les dossiers techniques amiante (DTA) des ouvrages existants ;
4. tout document relatif à la présence d'autres polluants (plomb, HAP dans les enrobés, terres polluées) susceptibles d'affecter nos conditions d'intervention.

Nous vous rappelons qu'en l'absence de transmission de ces documents, notre personnel ne peut être exposé à un risque non évalué, et que nous serions contraints, conformément à nos obligations légales de sécurité (articles L. 4121-1 et suivants du Code du travail), de ne pas engager ou de suspendre les travaux sur les zones concernées, sans que ce report puisse nous être imputé.

Toute incidence de cette situation sur les délais et les coûts d'exécution ferait l'objet des demandes de prolongation et de rémunération correspondantes, sur lesquelles nous formulons dès à présent toutes réserves.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  devoir_conseil: {
    label: 'Signalement au titre du devoir de conseil',
    objet: 'Signalement au titre de notre devoir de conseil — [objet]',
    corps: `Madame, Monsieur,

Dans le cadre de l'exécution du marché cité en objet, et au titre de notre devoir de conseil, nous estimons de notre responsabilité de porter à votre connaissance les éléments suivants :

[Exposé précis et factuel de la difficulté identifiée : anomalie des études ou du dossier de consultation, risque technique, incompatibilité de planning, insuffisance d'une prestation prévue, risque pour la sécurité ou la pérennité de l'ouvrage.]

Cette situation est susceptible d'entraîner les conséquences suivantes : [conséquences techniques, financières, de délais ou de sécurité].

En conséquence, nous vous recommandons : [préconisations précises et hiérarchisées de l'entreprise].

Il appartient à la maîtrise d'ouvrage et à la maîtrise d'œuvre de prendre position sur ces préconisations. Nous vous demandons de bien vouloir nous notifier vos instructions dans un délai compatible avec le planning d'exécution, soit au plus tard le [date].

À défaut d'instructions dans ce délai, ou en cas de décision de maintenir les dispositions actuelles, nous poursuivrons l'exécution conformément au marché ; le présent courrier établit toutefois que l'information vous a été délivrée de manière complète et en temps utile, et nous déchargerons toute responsabilité quant aux conséquences de la situation signalée, sur lesquelles nous formulons toutes réserves.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },

  demande_os_poursuite: {
    label: "Demande d'ordre de service (poursuite des travaux)",
    objet: "Demande de notification d'un ordre de service de poursuite des travaux",
    corps: `Madame, Monsieur,

Par courrier du [date de l'alerte], nous vous avons notifié, conformément à l'article 15.2 du CCCG Travaux SNCF, que la masse des travaux exécutés atteignait la masse initiale du marché.

À ce jour, et sauf erreur de notre part, aucun ordre de service portant décision de poursuite des travaux et fixation du montant limite ne nous a été notifié.

Nous attirons votre attention sur le fait que la poursuite de l'exécution au-delà de la masse initiale, en l'absence d'ordre de service, expose les parties à une insécurité juridique et financière incompatible avec la bonne conduite de l'opération : engagement de moyens humains et matériels sans couverture contractuelle, difficultés de règlement des situations correspondantes, désorganisation du planning en cas d'interruption.

En conséquence, nous vous demandons instamment de nous notifier, sous [huit] jours, l'ordre de service décidant de la poursuite des travaux et indiquant le montant limite jusqu'où ils peuvent être poursuivis.

À défaut, nous serions contraints de suspendre l'exécution des prestations excédant la masse initiale du marché, conformément aux stipulations précitées, sans que cette suspension puisse nous être imputée à faute ; les conséquences de cette suspension sur les délais et les coûts feraient l'objet de toutes réserves.

Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.`,
  },
}
