import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialite - Conduc Rail',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-8 px-6" style={{ backgroundColor: '#004489' }}>
        <div className="max-w-3xl mx-auto">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            &larr; Retour
          </Link>
          <h1 className="text-2xl font-bold text-white mt-3">
            POLITIQUE DE CONFIDENTIALITE
          </h1>
          <p className="text-sm text-white/70 mt-1">CONDUC RAIL</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-[#5A5A5A] mb-8">
          Derniere mise a jour : 08/04/2026
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            1. Responsable du traitement
          </h2>
          <p className="text-sm text-[#000000] leading-relaxed">
            L&apos;application Conduc Rail est operee par l&apos;entreprise de
            l&apos;utilisateur administrateur. Pour toute question relative au
            traitement de vos donnees, contactez l&apos;administrateur de
            l&apos;application.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            2. Donnees collectees
          </h2>
          <ul className="list-disc pl-5 text-sm text-[#000000] space-y-1 leading-relaxed">
            <li>
              <strong>Donnees d&apos;identification :</strong> nom, prenom,
              email, mot de passe (hashe bcrypt)
            </li>
            <li>
              <strong>Donnees professionnelles :</strong> poste, telephone,
              entreprise
            </li>
            <li>
              <strong>Donnees de projet :</strong> rapports journaliers,
              tableaux de service, soudures, compositions, courriers
            </li>
            <li>
              <strong>Logo societe</strong> (optionnel, stocke en base64)
            </li>
            <li>
              <strong>Fichiers joints</strong> aux evenements du journal
              (images, PDF)
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            3. Finalite du traitement
          </h2>
          <p className="text-sm text-[#000000] leading-relaxed mb-2">
            Les donnees sont collectees et traitees pour :
          </p>
          <ul className="list-disc pl-5 text-sm text-[#000000] space-y-1 leading-relaxed">
            <li>Gestion des chantiers ferroviaires</li>
            <li>Suivi de l&apos;avancement des travaux</li>
            <li>Gestion du personnel de chantier</li>
            <li>Export de rapports et documents contractuels</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            4. Base legale
          </h2>
          <p className="text-sm text-[#000000] leading-relaxed">
            Le traitement est fonde sur l&apos;execution du contrat de travail
            et l&apos;interet legitime de l&apos;entreprise pour la gestion de
            ses chantiers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            5. Duree de conservation
          </h2>
          <ul className="list-disc pl-5 text-sm text-[#000000] space-y-1 leading-relaxed">
            <li>
              <strong>Comptes utilisateurs :</strong> conserves tant que le
              compte est actif
            </li>
            <li>
              <strong>Donnees de projet :</strong> conservees pendant la duree
              du projet + 10 ans (archives)
            </li>
            <li>
              <strong>Logs de connexion :</strong> 1 an
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            6. Destinataires
          </h2>
          <p className="text-sm text-[#000000] leading-relaxed">
            Les donnees sont accessibles uniquement aux utilisateurs
            authentifies de l&apos;application ayant les droits d&apos;acces
            appropries (systeme de membership par projet). Aucune donnee
            n&apos;est transmise a des tiers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            7. Hebergement
          </h2>
          <ul className="list-disc pl-5 text-sm text-[#000000] space-y-1 leading-relaxed">
            <li>
              <strong>Application :</strong> Vercel (serveurs en Europe/US)
            </li>
            <li>
              <strong>Base de donnees :</strong> Supabase (PostgreSQL, serveurs
              EU West)
            </li>
            <li>Aucun transfert hors UE non encadre</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            8. Securite
          </h2>
          <ul className="list-disc pl-5 text-sm text-[#000000] space-y-1 leading-relaxed">
            <li>Mots de passe hashes (bcrypt, 12 rounds)</li>
            <li>Connexion HTTPS obligatoire (HSTS)</li>
            <li>
              Row Level Security (RLS) active sur la base de donnees
            </li>
            <li>
              Headers de securite : CSP, X-Frame-Options, nosniff
            </li>
            <li>Authentification requise pour toutes les pages</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            9. Vos droits
          </h2>
          <p className="text-sm text-[#000000] leading-relaxed mb-2">
            Conformement au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-5 text-sm text-[#000000] space-y-1 leading-relaxed">
            <li>Droit d&apos;acces a vos donnees personnelles</li>
            <li>Droit de rectification</li>
            <li>
              Droit a l&apos;effacement (&quot;droit a l&apos;oubli&quot;)
            </li>
            <li>Droit a la portabilite de vos donnees</li>
            <li>Droit d&apos;opposition au traitement</li>
          </ul>
          <p className="text-sm text-[#000000] leading-relaxed mt-3">
            Pour exercer vos droits, contactez l&apos;administrateur de
            l&apos;application ou utilisez les fonctions &quot;Exporter mes
            donnees&quot; et &quot;Supprimer mon compte&quot; disponibles dans
            votre profil.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#004489] mb-3 pb-2 border-b border-[#DCDCDC]">
            10. Cookies
          </h2>
          <p className="text-sm text-[#000000] leading-relaxed mb-2">
            L&apos;application utilise uniquement des cookies strictement
            necessaires :
          </p>
          <ul className="list-disc pl-5 text-sm text-[#000000] space-y-1 leading-relaxed">
            <li>Cookie de session (authentification NextAuth)</li>
            <li>Cookie de consentement</li>
          </ul>
          <p className="text-sm text-[#000000] leading-relaxed mt-2">
            Aucun cookie publicitaire ou de suivi n&apos;est utilise.
          </p>
        </section>
      </div>
    </div>
  )
}
