# Smart order
**Blockchain et santé: preuve de concept pour des ordonnances distribuées.**

*Auteurs : Jules Lainé, Louis Torbay et Pier-Jean Malandrino - ( [Scub, ESN spécialiste digital des métiers de l’assurance](https://www.scub.net/) ) .*

Vous trouverez les sources et les instructions pour mettre en place cette plarforme à [cette adresse](https://github.com/scub-france/smart-order).

## Les enjeux de la prescription

Les problématiques liées au circuit du médicament sont multiples et les problèmes rencontrés sont aussi bien induits par l’humain que par la technique. Smart Order a été pensé et conçu en prenant en considération les principaux enjeux liés à la fraude et à la complexité du suivi des actions, afin de permettre une amélioration significative du processus, de la prescription à la  délivrance médicamenteuse.

### La dissémination de l’information
Si les progrès techniques ont rapidement pris leur place dans le diagnostic et la pratique de la médecine, les informations ayant trait au parcours de soin des patients restent encore largement éparpillées dans de multiples silos. Ce phénomène est accentué par les contraintes légales du secret médical et n’est pas exempt de conséquences négatives.

La dissémination de l’information limite la possibilité de consulter efficacement l’historique médical d’un patient et rend plus compliquée l’obtention d’une vision globale des émissions de prescriptions et des consommations médicamenteuses. La nécessité d’une perception globale est pourtant d’un intérêt capital, car profitable à différentes échelles pour tous les  acteurs (patient, médecin, pharmacien, fabricants, instances médicales et assurance sociale).

Une disponibilité complète et instantanée des prescriptions et des consommations pourrait par exemple permettre à des laboratoires de recherche et aux autorités publiques de disposer de données quantifiables afin d’établir des statistiques de consommation, pour détecter les contre-indications médicamenteuses et donner l’alerte sur les substances potentiellement néfastes.

Elle pourrait également permettre aux assurances de simplifier la gestion des flux financiers qui leur sont liés, et permettre au personnel soignant d'avoir des informations sur l’historique de chaque patient et ainsi éliminer de potentielles sources d’erreurs.

Dans le cas d’une médication croisée avec plusieurs médecins en simultané ou en cas  d'ordonnance falsifiée, il peut devenir très compliqué de déterminer quel acteur a engagé sa responsabilité ou a commis une erreur, et dans quelles conditions, sur l’ensemble du cycle de vie des prescriptions.

L’ordonnance est un des outils utilisés pour assurer la traçabilité des actions des acteurs. Elle a un rôle essentiel dans le conditionnement de l’accès aux remèdes et dans la transition médicamenteuse entre médecine de ville et d'hôpital. 

La prescription comme la délivrance des médicaments engage la responsabilité de différents acteurs, et lorsqu’un accident survient, les preuves dont l’on peut disposer permettent de mieux appréhender la situation et d’y apporter une réponse appropriée.

### Les ordonnances et la fraude
Le système des ordonnances impose un cadre légal qui spécifie la responsabilité des parties prenantes. L’ordonnance est une formalisation de l’échange d’informations qui a lieu entre le patient et le corps médical ou entre professionnels de santé. 

En France comme dans beaucoup d’autres pays, les prescriptions médicamenteuses se font encore majoritairement via un support papier. Ces documents volatiles sont la plupart du temps facilement reproductibles et altérables, malgré leur rôle central dans l’accès aux remèdes. Les documents manuscrits peuvent également être sources d’erreurs ou d’interprétation à la lecture, amenant ainsi une source supplémentaire de risque  lors de la délivrance de prescription. Si la délivrance des substances les plus sensibles ou dangereuses est soumise à la présentation d’une variante de document dite “sécurisée”, ces précautions en plus d’être coûteuses ne garantissent pas de façon absolue ni l’authenticité du document, ni la régularité de son obtention. 

  * La détection des ordonnances falsifiées est souvent fonction de l’appréciation du pharmacien et le refus de prescription est généralement motivé par des détails tels que l’aspect de l’ordonnance, le style rédactionnel ou encore le comportement du patient. Ces perceptions sont fondamentalement subjectives, et leur exercice représente une contrainte récurrente pour les praticiens. Si la majorité des signalements concerne les ordonnances manuscrites, les ordonnances numériques sont aussi concernées par les abus alors que la fraude y est par nature plus difficile à détecter. Plusieurs stratégies peuvent être employées pour tenter d’abuser du système :
  * un patient mal intentionné peut dupliquer une ordonnance et la présenter dans des pharmacies différentes. Il sera alors impossible pour un pharmacien de savoir si cette ordonnance a déjà été utilisée [2](https://documentation.ehesp.fr/memoires/2014/phisp/pons.pdf), il est possible de récupérer l’ensemble des détails sur l'ordonnance et de changer la prescription en imitant l’écriture du médecin,
  * la fraude peut également provenir des professionnels de santé [3](https://www.ameli.fr/fileadmin/user_upload/documents/cp23022006.pdf). Les transporteurs sanitaires, médecins, pharmaciens ou laboratoires, etc. sont parfois directement impliqués dans la falsification des ordonnances. 


### Synthèse
La prescription comme la délivrance de médicaments sont des actes incontournables de l’activité médicale mais ils sont pourtant complexes à appréhender. De nombreux acteurs sont impliqués dans le processus et ils peuvent avoir des avis ou des intérêts divergents. 

Ces actes sont des marqueurs du parcours de soin et présentent en tant que tel des enjeux considérables en terme de traçabilité. La fraude, ainsi que les erreurs de prescription, de délivrance ou de dispensation sont lourdes de conséquences humaines et financières. Une démarche de sécurisation dans le domaine est indispensable.

La transformation numérique déjà en cours a permis des améliorations mais son avancement demeure inégal selon les lieux et les types d’activités. Cette évolution doit se poursuivre pour perfectionner les processus actuels et permettre de nouveaux usages. Le système de demain ne pourra néanmoins pas se soustraire aux fortes contraintes législatives qui encadrent le domaine de la santé, tel que le secret médical.

C’est dans ce contexte que nous avons imaginé Smart Order, une solution basée sur la technologie blockchain et sur les smart-contracts, qui permet d’assurer un suivi, une historisation et une meilleure sécurisation des échanges entre les différentes parties.

## La blockchain et les smart-contracts
La blockchain (“chaîne de bloc” en français) est une technologie apparue en 2008. Elle permet le stockage et la transmission d’informations. Il s’agit d’une base de données mondiale, partagée entre utilisateurs et fonctionnant sans organe central de contrôle. Elle contient l’historique complet de tous les échanges entre utilisateurs depuis sa création. Toute personne ayant accès au réseau peut consulter les données en temps réel et interagir avec elle. 

Une blockchain peut être publique (ouverte à tous) ou privée. Son accès et son utilisation sont alors restreints à un certain nombre d’acteurs. Dans le cadre d’une blockchain publique, le réseau en charge du maintien opérationnel de la blockchain est mondial et librement accessible. Cela lui confère une très forte garantie de disponibilité, seule une panne globale pouvant menacer la continuité de service. Dans le cas d’une panne isolée, un opérateur peut temporairement assurer un fonctionnement local de sa solution.

La construction de cette technologie offre une très grande sécurité notamment grâce au nombre d’acteurs sur le réseau. Les techniques mathématique de cryptographie employées pour la sécurisation des données rendent la blockchain infalsifiable et les potentielles attaques extrêmement visibles. Cette inaltérabilité permet aux utilisateurs d’effectuer des transactions en toute confiance, même en l'absence d'une autorité centrale.

Des outils tels que les smart-contracts peuvent compléter la blockchain pour permettre la création de nouveaux types d’applications. Un smart-contract est un programme autonome résidant dans une chaîne de blocs et qui exécute automatiquement les conditions et les termes d’un contrat prédéfini, sans nécessiter d’intervention humaine. 

Les transactions étant publiques, chaque action accomplie par le programme est consignée et horodatée et les acteurs utilisant ces fonctionnalités sont identifiés par une identité numérique ne permettant pas d’identifier simplement la personne physique.

## Le prototype Smart Order 
Dans le cadre de notre preuve de concept, nous avons choisi d’utiliser une blockchain privée appelée Ethereum. Les opérations effectuées par le programme et les informations affichées proviennent exclusivement de cette blockchain. Les interfaces utilisateur que nous avons développées permettent d’itérer sur les principales étapes du cycle de vie d’une ordonnance. Ainsi le prototype permet à un docteur de rédiger et d’émettre une ordonnance puis à un pharmacien de la consulter et d’en délivrer des éléments. 


### Interface de prescription
Le bandeau bleu indique le titre de l’utilisateur (ici “médecin”) et son identité numérique [a.]. Cette identité sera désignée comme émettrice de l’ordonnance. La première partie de l’écran contient un tableau [b.] qui regroupe les informations et les identifiants des ordonnances déjà émises. La seconde partie [c.] permet alternativement la rédaction ou la consultation d’une ordonnance.

![Ordonnances médecin avec la blockchain](https://github.com/scub-france/smart-order/blob/master/docs/assets/images/blockchain-mes-ordonnances-medecin.png?raw=true)

#### Rédaction d’une ordonnance
Pour qu’une nouvelle ordonnance soit complète, il est nécessaire que les informations suivantes soient renseignées :
  * l’identifiant du praticien réalisant la prescription [d.],
  * l’identifiant du tiers à qui le traitement est prescrit [e.],
  * la ou les médications (molécule, quantité, unité de mesure et posologie) [f.]

#### Emission de la prescription
Lors de l’édition d’un document, les informations saisies sont transformées en une empreinte cryptographique unique, ici prenant la forme d’un QR-Code [g.]. Pour pouvoir procéder à l’émission d’une ordonnance, cette empreinte doit être signée numériquement par le prescripteur et par le patient. 

L’action de signature du médecin est matérialisée par un bouton “Signer” [h.]. La contre-signature du document par le patient se fait sur un second écran. En situation réelle ce processus pourrait prendre la forme d’une carte à puce à insérer dans un terminal.

Lorsque tous ces éléments sont renseignés, le prescripteur peut alors soumettre la nouvelle ordonnance qui sera automatiquement validée puis inscrite dans la blockchain. L’empreinte du document servira d’identifiant, il permettra au patient de présenter sa prescription à des tiers tels que médecins et pharmaciens.

### Interface de dispensation
Cet écran est à destination du pharmacien et sa conception est globalement similaire à celle du médecin. Le bandeau vert indique que l’utilisateur est un pharmacien et affiche aussi son identité numérique. La première partie de l’interface [i.] liste les délivrances faites par ce dernier tandis que la seconde partie [j.] lui permet de consulter en détail l’état d’une ordonnance. 

![Ordonnances pharmacien avec la blockchain](https://github.com/scub-france/smart-order/blob/master/docs/assets/images/blockchain-mes-ordonnances-pharmacien.png?raw=true)

#### Récupération d’une ordonnance
Une fois que le document a été enregistré dans la blockchain par le médecin, le patient peut se rendre dans la pharmacie de son choix et communiquer à son interlocuteur l’identifiant de l’ordonnance qui motive son déplacement. Avec cet identifiant le pharmacien est alors en mesure de récupérer le document et d’en consulter les détails. 

Une barre de recherche [k.] a été ajoutée à cette interface pour permettre la récupération d’ordonnance par identifiant. En situation réelle ce processus pourrait à nouveau prendre la forme d’une carte à puce à insérer dans un terminal.

#### Dispensation de l’ordonnance
Lorsque le pharmacien sélectionne une ordonnance, toutes les informations relatives à cette dernière sont affichées [j.]. L’utilisateur peut alors consulter l’état actuel du document et afficher l’historique des opérations de délivrances partielles ou totales déjà réalisées.

Pour procéder à la dispensation d’une prescription, le responsable de santé doit ensuite saisir dans le formulaire les quantités de médicament qu’il va remettre au patient [l.] puis signer numériquement le contenu de la délivrance à l’aide du bouton “Signer” [m.]. Pour que la délivrance soit valide, le patient doit également signer le document avec la même clé que celle utilisée lors de la création de l’ordonnance. Cette opération pourrait ici encore prendre la forme d’une carte à puce à insérer dans un terminal.

Au moment ou le pharmacien valide la délivrance, le smart-contract vérifie la cohérence de l’acte et la conformité des signatures puis les modalités de la délivrance sont ensuite archivées dans la blockchain.

### Spécificités de Smart Order

#### Garanties de validité
Si la technologie de stockage blockchain assure la disponibilité et l’authenticité des données, elle ne garantit cependant pas leur validité. Les smart-contracts répondent à cette problématique en permettant de spécifier les règles d’exécution du programme. Dans sa version initiale, Smart Order ne permet d’émettre qu’un seul type d’ordonnance et impose  le respect des conditions suivantes :
  * seul un médecin peut émettre une ordonnance,
  * seul un pharmacien peut délivrer les substances d’une ordonnance,
  * un pharmacien ne peut pas délivrer plus de substance que ce qui a été prescrit,
  * un pharmacien ne peut pas délivrer des éléments d’une ordonnance dont la date de validité est dépassée.

L’appartenance d’un individu à une catégorie donnée (médecin ou pharmacien) est déterminée à l’aide d’un registre privé, non hébergé sur la blockchain et qui recense les identifiants numériques valides. Ce registre est systématiquement interrogé par le smart-contract avant toute demande d’opération nécessitant des droits particuliers. En dehors du propriétaire de l’identifiant, seul l’administrateur du registre est en capacité de relier identité physique et digitale, préservant ainsi l'anonymat des acteurs. 

En situation réelle, de tels registres pourraient être gérés par des agences gouvernementales type RPPS / Adeli.

#### Intégrité et traçabilité
Pour qu’une ordonnance puisse être émise ou modifiée, toutes les parties prenantes doivent utiliser leur identité numérique pour signer une empreinte décrivant les modalités de l’acte. Ces signatures sont infalsifiables, non réutilisables et irrévocables. 

Chaque signature étant propre à un utilisateur et à un acte donné,  Il est impossible de réutiliser la même signature pour des actes différents. Il est également impossible pour un médecin d’émettre une ordonnance qui ne l’identifie pas comme prescripteur. Seule la personne en possession du secret associé à un identifiant donné est en mesure de produire une signature valide. Il est donc également impossible pour un acteur de nier sa participation à un acte lorsque sa signature est présente dans la blockchain.

## Et ensuite ?
Si le prototype démontre bien la faisabilité du concept, le travail de réflexion qui a été engagé va encore plus loin et des développements restent à entreprendre. Le lecteur trouvera dans cette section des exemples de thématiques que nous souhaiterions à présent explorer.

### Interopérabilité
Smart Order utilise des protocoles standards de la communication web mais aussi des outils propres à la technologie des smart-contracts. Pour faciliter l’intégration de notre solution à une infrastructure médicale existante, il faudrait permettre l’échange d’informations via la norme FIHR. L’intégration d’un tel standard permettrait par exemple de faire fonctionner notre solution avec des logiciels d’aide à la prescription, ou même des armoires à pharmacies connectées.

### Gestion des identités
Toutes les données enregistrées sur la blockchain sont anonymisées et seuls les identifiants numériques sont utilisés. Dans le cadre du prototype, chaque acteur utilise un identifiant constant pour revendiquer son identité. Cependant, ce comportement n’est pas adapté à une situation réaliste car il implique que toute personne ayant accès à la blockchain puisse regrouper des ordonnances distinctes en observant les identifiants utilisés. 

Cette problématique pourrait être résolue grâce à des techniques cryptographiques dites de “dérivation”, qui permettent de fournir aux acteurs des identifiants à usage unique, à partir d’un mot de passe personnel. Cette nouvelle mécanique permettrait également d’implémenter des fonctionnalités avancées de partage d’historique. Elle pourrait par exemple permettre à un patient de partager automatiquement avec un tiers de confiance toutes ses ordonnances en relation avec un épisode médical particulier, ou encore émises après une date donnée.

### Etudes complémentaires
Le socle technologique de Smart Order et les choix techniques qui ont été pris ont un impact important sur les caractéristiques de la solution. Nous avons choisi d’utiliser une blockchain Ethereum car il s’agit de la technologie de smart-contract la plus mature et la plus adéquate au prototypage. Il existe des alternatives à Ethereum mais elles présentent des caractéristiques différentes en termes de performance, de sécurité et de coûts qu’il faudrait analyser. Dans une démarche d’amélioration du prototype, il sera nécessaire de réaliser une série d’études complémentaires pour éprouver la fiabilité de la solution et quantifier les coûts d’une mise en production.
