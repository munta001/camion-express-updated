import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "cr" | "en" | "fr";

const translations = {
  // Navbar
  "nav.home": { cr: "Lakaz", en: "Home", fr: "Accueil" },
  "nav.services": { cr: "Servis", en: "Services", fr: "Services" },
  "nav.fleet": { cr: "Nou Camion", en: "Our Lorry", fr: "Nos Camions" },
  "nav.quotation": { cr: "Demann Kotasyon", en: "Request Quotation", fr: "Demande de Devis" },
  "nav.contact": { cr: "Kontakte Nou", en: "Contact", fr: "Contact" },
  "nav.ownerLogin": { cr: "Login Proprieter", en: "Owner Login", fr: "Connexion Propriétaire" },
  "nav.admin": { cr: "Admin", en: "Admin", fr: "Admin" },
  "nav.dashboard": { cr: "Dashboard", en: "Dashboard", fr: "Tableau de Bord" },

  // Home
  "home.tagline": { cr: "Nou livré ou materiaux dan ler fami.", en: "Nou livré ou materiaux dan ler fami.", fr: "Nou livré ou materiaux dan ler fami." },
  "home.subtitle": { cr: "Ou partenaire konfians pou transpor prodwi basalt ek materyo konstriksyon dan Moris.", en: "Your trusted partner for basalt products and construction material transport across Mauritius.", fr: "Votre partenaire de confiance pour le transport de produits basaltiques et de matériaux de construction à Maurice." },
  "home.requestQuotation": { cr: "Demann Kotasyon", en: "Request Quotation", fr: "Demande de Devis" },
  "home.ourServices": { cr: "Nou Servis", en: "Our Services", fr: "Nos Services" },
  "home.whatWeDo": { cr: "KI NOU", en: "WHAT WE", fr: "CE QUE NOUS" },
  "home.whatWeDoHighlight": { cr: "FER", en: "DO", fr: "FAISONS" },
  "home.basaltProducts": { cr: "Prodwi Basalt", en: "Basalt Products", fr: "Produits Basaltiques" },
  "home.basaltProductsDesc": { cr: "Transpor agregat basalt, ros kase, ek materyo basalt bri.", en: "Transport of basalt aggregates, crushed stone, and raw basalt materials.", fr: "Transport d'agrégats de basalte, de pierres concassées et de matériaux bruts." },
  "home.constructionHaulage": { cr: "Transport Konstriksyon", en: "Construction Haulage", fr: "Transport de Construction" },
  "home.constructionHaulageDesc": { cr: "Disab, gravie, siman, fer, ek tou materyo konstriksyon.", en: "Sand, gravel, cement, steel, and all construction material delivery.", fr: "Sable, gravier, ciment, acier et livraison de tous les matériaux de construction." },
  "home.safeInsured": { cr: "Sekirite & Asirans", en: "Safe & Insured", fr: "Sécurisé & Assuré" },
  "home.safeInsuredDesc": { cr: "Camion ki konpletman asire avek sofer expérimante pou sak sarz.", en: "Fully insured lorries with experienced drivers for every load.", fr: "Camions entièrement assurés avec des chauffeurs expérimentés pour chaque chargement." },
  "home.onTimeDelivery": { cr: "Livrezon Aler", en: "On-Time Delivery", fr: "Livraison Ponctuelle" },
  "home.onTimeDeliveryDesc": { cr: "Planifikasyon fiab pou gard ou proze konstriksyon lor bon sime.", en: "Reliable scheduling to keep your construction projects on track.", fr: "Planification fiable pour garder vos projets de construction sur la bonne voie." },
  "home.readyTo": { cr: "PARE POU", en: "READY TO", fr: "PRÊT À" },
  "home.move": { cr: "BOUZE?", en: "MOVE?", fr: "BOUGER ?" },
  "home.ctaDesc": { cr: "Gagn enn kotasyon gratis pou ou prosenn travay transpor konstriksyon dan Moris.", en: "Get a free quotation for your next construction transport job across Mauritius.", fr: "Obtenez un devis gratuit pour votre prochain transport de construction à Maurice." },
  "home.viewFleet": { cr: "Get Nou Camion", en: "View Our Lorries", fr: "Voir Nos Camions" },
  "home.paymentTerms": { cr: "KONDISYON", en: "PAYMENT", fr: "CONDITIONS DE" },
  "home.paymentTermsHighlight": { cr: "PEMAN", en: "TERMS", fr: "PAIEMENT" },
  "home.paymentTermsDesc": { cr: "Silvouple pran not lor nou kondisyon peman avan konfirm ou livrezon.", en: "Please take note of our payment terms before confirming your delivery.", fr: "Veuillez prendre note de nos conditions de paiement avant de confirmer votre livraison." },
  "home.depositRule": { cr: "Enn depo 50% obligatwar lor konfirmasyon livrezon.", en: "A 50% deposit is required upon confirmed delivery.", fr: "Un acompte de 50% est requis à la confirmation de la livraison." },
  "home.depositDetail1": { cr: "50% peman avan livrezon koumanse", en: "50% payment before delivery begins", fr: "50% de paiement avant le début de la livraison" },
  "home.depositDetail2": { cr: "Balans 50% peyab apre livrezon konplete", en: "Remaining 50% payable after delivery is completed", fr: "50% restant payable après la livraison" },
  "home.depositDetail3": { cr: "Peman par transfer bank oubien cash aksepte", en: "Payment via bank transfer or cash accepted", fr: "Paiement par virement bancaire ou en espèces accepté" },

  // Services
  "services.title": { cr: "NOU", en: "OUR", fr: "NOS" },
  "services.titleHighlight": { cr: "SERVIS", en: "SERVICES", fr: "SERVICES" },
  "services.subtitle": { cr: "Solusyon transpor konplet pou prodwi basalt ek materyo konstriksyon dan Moris.", en: "Comprehensive transport solutions for basalt products and construction materials across Mauritius.", fr: "Solutions de transport complètes pour les produits basaltiques et matériaux de construction à Maurice." },
  "services.basaltTransport": { cr: "Transpor Basalt", en: "Basalt Transport", fr: "Transport de Basalte" },
  "services.basaltTransportDesc": { cr: "Nou spesialize dan transpor agregat basalt, ros kase, ek materyo basalt bri depi karer ver sit konstriksyon dan Moris.", en: "We specialize in transporting basalt aggregates, crushed stone, and raw basalt materials from quarries to construction sites across Mauritius.", fr: "Nous sommes spécialisés dans le transport d'agrégats de basalte, de pierres concassées et de matériaux bruts des carrières aux chantiers à Maurice." },
  "services.quarryPickup": { cr: "Ramase depi karer", en: "Quarry pickup", fr: "Ramassage en carrière" },
  "services.bulkAggregates": { cr: "Agregat an gro", en: "Bulk aggregates", fr: "Agrégats en vrac" },
  "services.crushedStoneDelivery": { cr: "Livrezon ros kase", en: "Crushed stone delivery", fr: "Livraison de pierres concassées" },
  "services.rawBasalt": { cr: "Materyo basalt bri", en: "Raw basalt materials", fr: "Matériaux de basalte brut" },
  "services.constructionDelivery": { cr: "Livrezon Materyo Konstriksyon", en: "Construction Materials Delivery", fr: "Livraison de Matériaux de Construction" },
  "services.constructionDeliveryDesc": { cr: "Livrezon fiab tou materyo konstriksyon enkli disab, gravie, siman, fer, brik, ek blok.", en: "Reliable delivery of all construction materials including sand, gravel, cement, steel reinforcement, bricks, and blocks.", fr: "Livraison fiable de tous les matériaux de construction : sable, gravier, ciment, acier, briques et blocs." },
  "services.sandGravel": { cr: "Disab & gravie", en: "Sand & gravel", fr: "Sable & gravier" },
  "services.cementBags": { cr: "Sak siman", en: "Cement bags", fr: "Sacs de ciment" },
  "services.steelRebar": { cr: "Fer & rebar", en: "Steel & rebar", fr: "Acier & armature" },
  "services.bricksBlocks": { cr: "Brik & blok", en: "Bricks & blocks", fr: "Briques & blocs" },
  "services.projectLogistics": { cr: "Lozistik Proze", en: "Project Logistics", fr: "Logistique de Projet" },
  "services.projectLogisticsDesc": { cr: "Sipor lozistik konplet pou gran proze konstriksyon. Nou kordinn plizir livrezon ek zer planifikasyon.", en: "End-to-end logistics support for large construction projects. We coordinate multiple deliveries and manage scheduling to keep your project on track.", fr: "Support logistique complet pour les grands projets de construction. Nous coordonnons plusieurs livraisons et gérons la planification." },
  "services.multiDrop": { cr: "Livrezon miltipl", en: "Multi-drop delivery", fr: "Livraison multi-points" },
  "services.scheduledRuns": { cr: "Vwayaz planifie", en: "Scheduled runs", fr: "Trajets planifiés" },
  "services.fleetCoordination": { cr: "Kordinasyon camion", en: "Lorry coordination", fr: "Coordination de camions" },
  "services.siteTransfers": { cr: "Transfer sit-a-sit", en: "Site-to-site transfers", fr: "Transferts de site à site" },
  "services.generalHaulage": { cr: "Transport Zeneral", en: "General Haulage", fr: "Transport Général" },
  "services.generalHaulageDesc": { cr: "Apard konstriksyon, nou zer transport zeneral pou obze lour ek volimino ki bizin transpor fiab dan lil.", en: "Beyond construction, we handle general haulage for heavy and bulky items that need reliable transport across the island.", fr: "Au-delà de la construction, nous gérons le transport général d'objets lourds et volumineux à travers l'île." },
  "services.heavyEquipment": { cr: "Ekipman lour", en: "Heavy equipment", fr: "Équipement lourd" },
  "services.machineryTransport": { cr: "Transpor masinn", en: "Machinery transport", fr: "Transport de machines" },
  "services.bulkGoods": { cr: "Marsandiz an gro", en: "Bulk goods", fr: "Marchandises en vrac" },
  "services.islandCoverage": { cr: "Kouvertir lil antie", en: "Island-wide coverage", fr: "Couverture de toute l'île" },
  "services.comingSoon": { cr: "BIENTO", en: "COMING SOON", fr: "BIENTÔT" },
  "services.comingSoonDesc": { cr: "Nou pe agrandi nou servis pou ofer plis solusyon transpor pou konstriksyon.", en: "We are expanding our services to offer more construction transport solutions.", fr: "Nous élargissons nos services pour offrir plus de solutions de transport pour la construction." },
  "services.backhoeLoader": { cr: "Servis Backhoe Loader", en: "Backhoe Loader Service", fr: "Service Tractopelle" },
  "services.backhoeLoaderDesc": { cr: "Transpor backhoe loader ver ek depi sit konstriksyon.", en: "Transport of backhoe loaders to and from construction sites.", fr: "Transport de tractopelles vers et depuis les chantiers de construction." },
  "services.bobcat": { cr: "Servis Bobcat", en: "Bobcat Service", fr: "Service Bobcat" },
  "services.bobcatDesc": { cr: "Deplasma bobcat ek mini-chargeuz pou ou proze.", en: "Moving bobcats and mini loaders for your projects.", fr: "Déplacement de bobcats et mini-chargeurs pour vos projets." },
  "services.excavator": { cr: "Servis Excavator", en: "Excavator Service", fr: "Service Excavatrice" },
  "services.excavatorDesc": { cr: "Transpor excavator ek ekipman lour lor flatbed.", en: "Flatbed transport of excavators and heavy plant equipment.", fr: "Transport sur plateau d'excavatrices et d'équipements lourds." },
  "services.crane": { cr: "Servis Grua", en: "Crane Service", fr: "Service Grue" },
  "services.craneDesc": { cr: "Deplasma grua ek ekipman leve pou sit konstriksyon.", en: "Moving cranes and lifting equipment for construction sites.", fr: "Déplacement de grues et d'équipements de levage pour les chantiers." },

  // Fleet
  "fleet.title": { cr: "NOU", en: "OUR", fr: "NOS" },
  "fleet.titleHighlight": { cr: "CAMION", en: "LORRY", fr: "CAMIONS" },
  "fleet.subtitle": { cr: "Nou bann camion bien antreteni pare pou tou travay transpor konstriksyon dan Moris.", en: "Our well-maintained lorries ready to handle any construction haulage job across Mauritius.", fr: "Nos camions bien entretenus prêts pour tout travail de transport de construction à Maurice." },
  "fleet.noVehicles": { cr: "Pena veyikil disponib pou lemoman.", en: "No vehicles available at the moment.", fr: "Aucun véhicule disponible pour le moment." },
  "fleet.capacity": { cr: "Kapasite", en: "Capacity", fr: "Capacité" },
  "fleet.body": { cr: "Kor", en: "Body", fr: "Carrosserie" },
  "fleet.idealFor": { cr: "Ideal pou", en: "Ideal for", fr: "Idéal pour" },
  "fleet.maxLoad": { cr: "Sarz Max", en: "Max Load", fr: "Charge Max" },
  "fleet.bodySize": { cr: "Tay Kor", en: "Body Size", fr: "Taille" },
  "fleet.engine": { cr: "Motor", en: "Engine", fr: "Moteur" },
  "fleet.requestCamion": { cr: "Demann enn Camion", en: "Request a Camion", fr: "Demander un Camion" },

  // About
  "about.title": { cr: "LOR", en: "ABOUT", fr: "À PROPOS DE" },
  "about.titleHighlight": { cr: "NOU", en: "US", fr: "NOUS" },
  "about.p1": { cr: "Camion Express enn servis transpor kamyon premye klas ki spesialize dan prodwi basalt ek materyo konstriksyon dan Moris. Avek plizir lane lexperyans, nou finn batir enn repitasyon pou fiabilite, sekirite, ek livrezon aler.", en: "Camion Express is a premier lorry transport service specializing in basalt products and construction materials across Mauritius. With years of experience in the industry, we have built a reputation for reliability, safety, and on-time delivery.", fr: "Camion Express est un service de transport de camions de premier plan spécialisé dans les produits basaltiques et les matériaux de construction à Maurice. Avec des années d'expérience, nous avons bâti une réputation de fiabilité, de sécurité et de ponctualité." },
  "about.p2": { cr: "Nou bann camion bien antreteni zer tou depi agregat basalt kase ziska disab, gravie, siman, fer, ek lezot materyo konstriksyon esansiel. Kit ou bizin enn sel sarz oubien plizir camion pou enn gran proze, nou la pou ou.", en: "Our well-maintained lorries handle everything from crushed basalt aggregates to sand, gravel, cement, steel reinforcement, and other essential construction materials. Whether you need a single truckload or multiple lorries for a large-scale project, we've got you covered.", fr: "Nos camions bien entretenus gèrent tout, des agrégats de basalte concassés au sable, gravier, ciment, acier et autres matériaux de construction essentiels. Que vous ayez besoin d'un seul chargement ou de plusieurs camions pour un grand projet, nous sommes là pour vous." },
  "about.p3": { cr: "Nou fier pou konpran bann demand inik lozistik konstriksyon — dédlain sere, sarz lour, ek nesesite pou manip avek swin. Nou sofer expérimante ek lekip lozistik dedie asir sak livrezon ariv an sekirite ek aler.", en: "We pride ourselves on understanding the unique demands of construction logistics — tight deadlines, heavy loads, and the need for careful handling. Our experienced drivers and dedicated logistics team ensure every delivery arrives safely and on schedule.", fr: "Nous sommes fiers de comprendre les exigences uniques de la logistique de construction — délais serrés, charges lourdes et manipulation soigneuse. Nos chauffeurs expérimentés et notre équipe logistique dédiée assurent chaque livraison en toute sécurité et dans les délais." },
  "about.deliveriesMonthly": { cr: "Livrezon par Mwa", en: "Deliveries Monthly", fr: "Livraisons par Mois" },
  "about.lorriesInFleet": { cr: "Camion Disponib", en: "Lorries Available", fr: "Camions Disponibles" },
  "about.yearsExperience": { cr: "Lane Lexperyans", en: "Years Experience", fr: "Années d'Expérience" },

  // Contact
  "contact.title": { cr: "KONTAKTE", en: "CONTACT", fr: "CONTACTEZ" },
  "contact.titleHighlight": { cr: "NOU", en: "US", fr: "-NOUS" },
  "contact.subtitle": { cr: "Kontakte nou pou tou demand lor nou servis transpor.", en: "Reach out to us for any enquiries about our transport services.", fr: "Contactez-nous pour toute demande concernant nos services de transport." },
  "contact.phone": { cr: "Telefonn", en: "Phone", fr: "Téléphone" },
  "contact.email": { cr: "Limeil", en: "Email", fr: "Email" },
  "contact.address": { cr: "Ladres", en: "Address", fr: "Adresse" },
  "contact.yourName": { cr: "Ou Nom", en: "Your Name", fr: "Votre Nom" },
  "contact.yourEmail": { cr: "Ou Limeil", en: "Your Email", fr: "Votre Email" },
  "contact.yourMessage": { cr: "Ou Mesaz", en: "Your Message", fr: "Votre Message" },
  "contact.sendMessage": { cr: "Avoy Mesaz", en: "Send Message", fr: "Envoyer le Message" },

  // Quotation
  "quotation.title": { cr: "DEMANN", en: "REQUEST", fr: "DEMANDE DE" },
  "quotation.titleHighlight": { cr: "KOTASYON", en: "QUOTATION", fr: "DEVIS" },
  "quotation.subtitle": { cr: "Ranpli detay anba la ek nou pou zer enn camion pou ou.", en: "Fill in the details below and we'll arrange a camion for you.", fr: "Remplissez les détails ci-dessous et nous organiserons un camion pour vous." },
  "quotation.fullName": { cr: "Non Konplet *", en: "Full Name *", fr: "Nom Complet *" },
  "quotation.companyName": { cr: "Non Konpagni", en: "Company Name", fr: "Nom de l'Entreprise" },
  "quotation.email": { cr: "Limeil *", en: "Email *", fr: "Email *" },
  "quotation.phone": { cr: "Nimero Telefonn *", en: "Phone Number *", fr: "Numéro de Téléphone *" },
  "quotation.selectMaterial": { cr: "Swazir Materyo *", en: "Select Material *", fr: "Sélectionner le Matériau *" },
  "quotation.quantity": { cr: "Kantite Estime (tonn)", en: "Estimated Quantity (tonnes)", fr: "Quantité Estimée (tonnes)" },
  "quotation.pickupLocation": { cr: "Landrwa Ramase", en: "Pickup Location", fr: "Lieu de Ramassage" },
  "quotation.deliveryLocation": { cr: "Landrwa Livrezon *", en: "Delivery Location *", fr: "Lieu de Livraison *" },
  "quotation.preferredDate": { cr: "Dat Prefere *", en: "Preferred Date *", fr: "Date Préférée *" },
  "quotation.notes": { cr: "Not Siplemanter", en: "Additional Notes", fr: "Notes Supplémentaires" },
  "quotation.notesRequiredPlaceholder": { cr: "Presize ki materyo ou bizin *", en: "Please specify the material you need *", fr: "Veuillez préciser le matériau dont vous avez besoin *" },
  "quotation.notesRequiredHint": { cr: "* Obligatwar kan ou swazir 'Other'", en: "* Required when 'Other' is selected", fr: "* Obligatoire quand 'Other' est sélectionné" },
  "quotation.notesRequiredForOther": { cr: "Silvouple presize ki materyo ou bizin dan not siplemanter.", en: "Please specify the material in the additional notes.", fr: "Veuillez préciser le matériau dans les notes supplémentaires." },
  "quotation.submit": { cr: "Soumett Demand Kotasyon", en: "Submit Quotation Request", fr: "Soumettre la Demande de Devis" },
  "quotation.submitting": { cr: "Pe soumett...", en: "Submitting...", fr: "Envoi en cours..." },
  "quotation.success": { cr: "Demand kotasyon soumit! Nou pou reponn ou byento.", en: "Quotation request submitted! We'll get back to you shortly.", fr: "Demande de devis soumise ! Nous vous répondrons rapidement." },
  "quotation.error": { cr: "Pa finn kapav soumett demand. Silvouple re-esey.", en: "Failed to submit request. Please try again.", fr: "Échec de l'envoi. Veuillez réessayer." },

  // Login
  "login.title": { cr: "LOGIN", en: "OWNER", fr: "CONNEXION" },
  "login.titleHighlight": { cr: "PROPRIETER", en: "LOGIN", fr: "PROPRIÉTAIRE" },
  "login.subtitle": { cr: "Konekte pou zer ou camion ek livrezon.", en: "Sign in to manage your lorries and deliveries.", fr: "Connectez-vous pour gérer vos camions et livraisons." },
  "login.email": { cr: "Limeil", en: "Email", fr: "Email" },
  "login.password": { cr: "Mo-de-pas", en: "Password", fr: "Mot de passe" },
  "login.signIn": { cr: "Konekte", en: "Sign In", fr: "Se Connecter" },
  "login.signingIn": { cr: "Pe konekte...", en: "Signing in...", fr: "Connexion..." },
  "login.forgotPassword": { cr: "Bliye mo-de-pas?", en: "Forgot password?", fr: "Mot de passe oublié ?" },
  "login.noAccount": { cr: "Pena kont?", en: "Don't have an account?", fr: "Pas de compte ?" },
  "login.registerAsOwner": { cr: "Anrezistre kouma Proprieter", en: "Register as Owner", fr: "S'inscrire comme Propriétaire" },

  // Register
  "register.title": { cr: "ANREZISTRASYON", en: "OWNER", fr: "INSCRIPTION" },
  "register.titleHighlight": { cr: "PROPRIETER", en: "REGISTRATION", fr: "PROPRIÉTAIRE" },
  "register.subtitle": { cr: "Anrezistre kouma proprieter camion/fournier.", en: "Register as a lorry owner/supplier.", fr: "Inscrivez-vous en tant que propriétaire/fournisseur de camion." },
  "register.fullName": { cr: "Non Konplet *", en: "Full Name *", fr: "Nom Complet *" },
  "register.companyName": { cr: "Non Konpagni", en: "Company Name", fr: "Nom de l'Entreprise" },
  "register.phone": { cr: "Nimero Telefonn", en: "Phone Number", fr: "Numéro de Téléphone" },
  "register.email": { cr: "Limeil *", en: "Email *", fr: "Email *" },
  "register.password": { cr: "Mo-de-pas *", en: "Password *", fr: "Mot de passe *" },
  "register.confirmPassword": { cr: "Konfirm Mo-de-pas *", en: "Confirm Password *", fr: "Confirmer le Mot de passe *" },
  "register.register": { cr: "Anrezistre", en: "Register", fr: "S'inscrire" },
  "register.registering": { cr: "Pe anrezistre...", en: "Registering...", fr: "Inscription..." },
  "register.alreadyAccount": { cr: "Deza ena enn kont?", en: "Already have an account?", fr: "Vous avez déjà un compte ?" },
  "register.signIn": { cr: "Konekte", en: "Sign In", fr: "Se Connecter" },
  "register.checkEmail": { cr: "GET OU", en: "CHECK YOUR", fr: "VÉRIFIEZ VOTRE" },
  "register.checkEmailHighlight": { cr: "LIMEIL", en: "EMAIL", fr: "EMAIL" },
  "register.verificationSent": { cr: "Nou finn avoy enn lien verifikasyon lor", en: "We've sent a verification link to", fr: "Nous avons envoyé un lien de vérification à" },
  "register.afterVerifying": { cr: "Apre verifikasyon, enn administrater pou revize ek aprov ou kont.", en: "After verifying, an administrator will review and approve your account.", fr: "Après vérification, un administrateur examinera et approuvera votre compte." },
  "register.goToLogin": { cr: "Al lor Login", en: "Go to Login", fr: "Aller à la Connexion" },

  // Forgot Password
  "forgot.title": { cr: "REZET", en: "RESET", fr: "RÉINITIALISER" },
  "forgot.titleHighlight": { cr: "MO-DE-PAS", en: "PASSWORD", fr: "MOT DE PASSE" },
  "forgot.checkEmail": { cr: "Verifie ou limeil pou enn lien rezet mo-de-pas.", en: "Check your email for a password reset link.", fr: "Vérifiez votre email pour un lien de réinitialisation." },
  "forgot.backToLogin": { cr: "Retour lor Login", en: "Back to Login", fr: "Retour à la Connexion" },
  "forgot.send": { cr: "Avoy Lien Rezet", en: "Send Reset Link", fr: "Envoyer le Lien" },
  "forgot.sending": { cr: "Pe avoy...", en: "Sending...", fr: "Envoi..." },

  // Reset Password
  "reset.title": { cr: "NOUVO", en: "NEW", fr: "NOUVEAU" },
  "reset.titleHighlight": { cr: "MO-DE-PAS", en: "PASSWORD", fr: "MOT DE PASSE" },
  "reset.newPassword": { cr: "Nouvo Mo-de-pas", en: "New Password", fr: "Nouveau Mot de passe" },
  "reset.confirmPassword": { cr: "Konfirm Mo-de-pas", en: "Confirm Password", fr: "Confirmer le Mot de passe" },
  "reset.update": { cr: "Met Azour Mo-de-pas", en: "Update Password", fr: "Mettre à jour" },
  "reset.updating": { cr: "Pe met azour...", en: "Updating...", fr: "Mise à jour..." },

  // Owner Dashboard
  "ownerDash.title": { cr: "DASHBOARD", en: "OWNER", fr: "TABLEAU DE BORD" },
  "ownerDash.titleHighlight": { cr: "PROPRIETER", en: "DASHBOARD", fr: "PROPRIÉTAIRE" },
  "ownerDash.welcome": { cr: "Bienveni,", en: "Welcome,", fr: "Bienvenue," },
  "ownerDash.addLorry": { cr: "Azout Camion", en: "Add Lorry", fr: "Ajouter un Camion" },
  "ownerDash.signOut": { cr: "Dekonekte", en: "Sign Out", fr: "Déconnexion" },
  "ownerDash.myLorries": { cr: "MO CAMION", en: "MY LORRIES", fr: "MES CAMIONS" },
  "ownerDash.noLorries": { cr: "Ou pankor azout okenn camion.", en: "You haven't added any lorries yet.", fr: "Vous n'avez pas encore ajouté de camion." },
  "ownerDash.addFirst": { cr: "Azout ou premie camion →", en: "Add your first lorry →", fr: "Ajoutez votre premier camion →" },
  "ownerDash.assignedDeliveries": { cr: "LIVREZON ASIGNE", en: "ASSIGNED DELIVERIES", fr: "LIVRAISONS ASSIGNÉES" },
  "ownerDash.noDeliveries": { cr: "Pena livrezon asigne pou ou ankor.", en: "No deliveries assigned to you yet.", fr: "Aucune livraison assignée pour le moment." },
  "ownerDash.pending": { cr: "ATANN", en: "PENDING", fr: "EN ATTENTE" },
  "ownerDash.pendingHighlight": { cr: "APROVMAN", en: "APPROVAL", fr: "D'APPROBATION" },
  "ownerDash.pendingMsg": { cr: "Ou kont pe atann aprovman administrater. Ou pou kapav aksed ou dashboard enn fwa aprov.", en: "Your account is pending administrator approval. You'll be able to access your dashboard once approved.", fr: "Votre compte est en attente d'approbation. Vous pourrez accéder à votre tableau de bord une fois approuvé." },

  // Add Lorry
  "addLorry.title": { cr: "AZOUT NOUVO", en: "ADD NEW", fr: "AJOUTER UN NOUVEAU" },
  "addLorry.titleHighlight": { cr: "CAMION", en: "LORRY", fr: "CAMION" },
  "addLorry.subtitle": { cr: "Anrezistre enn nouvo camion.", en: "Register a new lorry.", fr: "Enregistrez un nouveau camion." },
  "addLorry.name": { cr: "Non Camion *", en: "Lorry Name *", fr: "Nom du Camion *" },
  "addLorry.regNumber": { cr: "Nimero Anrezistreman *", en: "Registration Number *", fr: "Numéro d'Immatriculation *" },
  "addLorry.licensePlate": { cr: "Plak Nimero *", en: "License Plate *", fr: "Plaque d'Immatriculation *" },
  "addLorry.capacity": { cr: "Kapasite (ex: 10 tonn) *", en: "Capacity (e.g. 10 tonnes) *", fr: "Capacité (ex: 10 tonnes) *" },
  "addLorry.maxLoad": { cr: "Sarz Maximom *", en: "Max Load *", fr: "Charge Max *" },
  "addLorry.bodyType": { cr: "Tip Kor (ex: Tipper) *", en: "Body Type (e.g. Tipper) *", fr: "Type de Carrosserie (ex: Benne) *" },
  "addLorry.bodySize": { cr: "Tay Kor *", en: "Body Size *", fr: "Taille de Carrosserie *" },
  "addLorry.engine": { cr: "Motor *", en: "Engine *", fr: "Moteur *" },
  "addLorry.idealFor": { cr: "Ideal pou (ex: Disab, Gravie)", en: "Ideal for (e.g. Sand, Gravel)", fr: "Idéal pour (ex: Sable, Gravier)" },
  "addLorry.available": { cr: "Disponib", en: "Available", fr: "Disponible" },
  "addLorry.inUse": { cr: "An itilizasyon", en: "In Use", fr: "En Utilisation" },
  "addLorry.maintenance": { cr: "An mantinans", en: "Under Maintenance", fr: "En Maintenance" },
  "addLorry.add": { cr: "Azout Camion", en: "Add Lorry", fr: "Ajouter le Camion" },
  "addLorry.adding": { cr: "Pe azout...", en: "Adding...", fr: "Ajout en cours..." },
  "addLorry.cancel": { cr: "Anile", en: "Cancel", fr: "Annuler" },
  "addLorry.image": { cr: "Foto Camion", en: "Lorry Image", fr: "Photo du Camion" },
  "addLorry.uploadImage": { cr: "Klik pou upload foto", en: "Click to upload image", fr: "Cliquez pour télécharger une photo" },

  // Admin Dashboard
  "adminDash.title": { cr: "DASHBOARD", en: "ADMIN", fr: "TABLEAU DE BORD" },
  "adminDash.titleHighlight": { cr: "ADMIN", en: "DASHBOARD", fr: "ADMIN" },
  "adminDash.subtitle": { cr: "Zer proprieter, camion, ek demand transpor.", en: "Manage owners, lorries, and quotation requests.", fr: "Gérer les propriétaires, camions et demandes de devis." },
  "adminDash.signOut": { cr: "Dekonekte", en: "Sign Out", fr: "Déconnexion" },
  "adminDash.owners": { cr: "Proprieter", en: "Owners", fr: "Propriétaires" },
  "adminDash.requests": { cr: "Demand Kotasyon", en: "Quotation Requests", fr: "Demandes de Devis" },
  "adminDash.allLorries": { cr: "Tou Camion", en: "All Lorries", fr: "Tous les Camions" },
  "adminDash.approved": { cr: "Aprov", en: "Approved", fr: "Approuvé" },
  "adminDash.pendingApproval": { cr: "Antatn", en: "Pending", fr: "En Attente" },
  "adminDash.noOwners": { cr: "Pena proprieter anrezistre ankor.", en: "No registered owners yet.", fr: "Aucun propriétaire enregistré pour le moment." },
  "adminDash.noRequests": { cr: "Pena demand kotasyon ankor.", en: "No quotation requests yet.", fr: "Aucune demande de devis pour le moment." },
  "adminDash.noLorries": { cr: "Pena camion anrezistre ankor.", en: "No lorries registered yet.", fr: "Aucun camion enregistré pour le moment." },
  "adminDash.assign": { cr: "Asigne", en: "Assign", fr: "Assigner" },
  "adminDash.assignDelivery": { cr: "ASIGNE", en: "ASSIGN", fr: "ASSIGNER" },
  "adminDash.assignDeliveryHighlight": { cr: "LIVREZON", en: "DELIVERY", fr: "LIVRAISON" },
  "adminDash.selectOwner": { cr: "Swazir Proprieter *", en: "Select Owner *", fr: "Sélectionner le Propriétaire *" },
  "adminDash.chooseOwner": { cr: "Swazir enn proprieter...", en: "Choose an owner...", fr: "Choisir un propriétaire..." },
  "adminDash.selectLorry": { cr: "Swazir Camion (opsionel)", en: "Select Lorry (optional)", fr: "Sélectionner un Camion (optionnel)" },
  "adminDash.chooseLorry": { cr: "Swazir enn camion...", en: "Choose a lorry...", fr: "Choisir un camion..." },
  "adminDash.cancel": { cr: "Anile", en: "Cancel", fr: "Annuler" },
  "adminDash.filterAll": { cr: "Tou", en: "All", fr: "Tous" },
  "adminDash.filterUnassigned": { cr: "Pa Asigne", en: "Unassigned", fr: "Non Assigné" },
  "adminDash.filterRecent": { cr: "Resan", en: "Recent", fr: "Récent" },
  "adminDash.filterDate": { cr: "Filtre par dat", en: "Filter by date", fr: "Filtrer par date" },
  "adminDash.clearFilters": { cr: "Efas filtr", en: "Clear filters", fr: "Effacer les filtres" },

  // Footer
  "footer.tagline": { cr: "Nou livré ou materiaux dan ler fami.", en: "We deliver your materials on time.", fr: "Nous livrons vos matériaux à temps." },
  "footer.subtitle": { cr: "Servis transpor camion fiab pou prodwi basalt ek materyo konstriksyon.", en: "Reliable lorry transport services for basalt products and construction materials.", fr: "Services de transport de camions fiables pour les produits basaltiques et matériaux de construction." },
  "footer.quickLinks": { cr: "Lien Rapid", en: "Quick Links", fr: "Liens Rapides" },
  "footer.contactInfo": { cr: "Info Kontak", en: "Contact Info", fr: "Coordonnées" },
  "footer.rights": { cr: "© 2026 Camion Express. Tou drwa rezeve.", en: "© 2026 Camion Express. All rights reserved.", fr: "© 2026 Camion Express. Tous droits réservés." },

  // NotFound
  "notFound.title": { cr: "Paz pa trouve", en: "Page not found", fr: "Page introuvable" },
  "notFound.back": { cr: "Retour Lakaz", en: "Return to Home", fr: "Retour à l'Accueil" },

  // Common
  "common.from": { cr: "Depi", en: "From", fr: "De" },
  "common.to": { cr: "Ver", en: "To", fr: "Vers" },
  "common.date": { cr: "Dat", en: "Date", fr: "Date" },
  "common.notes": { cr: "Not", en: "Notes", fr: "Notes" },
  "common.client": { cr: "Klian", en: "Client", fr: "Client" },
  "common.owner": { cr: "Proprieter", en: "Owner", fr: "Propriétaire" },
  "common.status": { cr: "Stati", en: "Status", fr: "Statut" },
  "common.pending": { cr: "Antatn", en: "Pending", fr: "En Attente" },
  "common.inProgress": { cr: "An progre", en: "In Progress", fr: "En Cours" },
  "common.completed": { cr: "Konplete", en: "Completed", fr: "Terminé" },
  "common.cancelled": { cr: "Anile", en: "Cancelled", fr: "Annulé" },
  "common.assignedTo": { cr: "Asigne a", en: "Assigned to", fr: "Assigné à" },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "cr",
  setLang: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "en" || saved === "cr" || saved === "fr") ? saved : "cr";
  });

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};