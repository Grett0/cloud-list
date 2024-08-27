// Fonction de hachage avec un salt
async function hashPasswordWithSalt(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Nombre de tentatives restantes
let attemptsLeft = 3;
const salt = "unique_salt_value"; // Un salt unique (mais qui peut être en dur ici)
const correctPasswordHash = 'c02b8d4f23d031e7c2a4a8bfd28faa5e3766439657919d90ca7745721c45413f'; // SHA-256 de '1234unique_salt_value'

// Charger les liens depuis le fichier JSON
fetch('links.json')
    .then(response => response.json())
    .then(data => {
        const linkTypeSelect = document.getElementById('link-type');
        const appSelect = document.getElementById('app-select');

        const localLinks = data.localLinks;
        const externalLinks = data.externalLinks;

        linkTypeSelect.addEventListener('change', function () {
            const selectedType = linkTypeSelect.value;
            appSelect.innerHTML = ''; // Réinitialiser les options
            appSelect.disabled = false; // Activer le menu déroulant des applications

            let options = '<option value="">- Sélectionnez une application -</option>';
            if (selectedType === 'local') {
                for (const app in localLinks) {
                    options += `<option value="${localLinks[app]}">${app}</option>`;
                }
            } else if (selectedType === 'external') {
                for (const app in externalLinks) {
                    options += `<option value="${externalLinks[app]}">${app}</option>`;
                }
            }
            appSelect.innerHTML = options;
        });

        document.getElementById('submit-btn').addEventListener('click', async function () {
            const selectedLink = appSelect.value;
            const password = document.getElementById('password').value;

            if (attemptsLeft <= 0) {
                alert('Trop de tentatives échouées. Veuillez réessayer plus tard.');
                return;
            }

            // Hachage du mot de passe + salt et vérification
            const hashedPassword = await hashPasswordWithSalt(password, salt);
            if (hashedPassword !== correctPasswordHash) {
                attemptsLeft--;
                alert(`Mot de passe incorrect. Il vous reste ${attemptsLeft} tentative(s).`);
                return;
            }

            if (!selectedLink) {
                alert('Veuillez sélectionner une application.');
                return;
            }

            const linkPrefix = linkTypeSelect.value === 'local' ? '' : '';
            window.open(`${linkPrefix}${selectedLink}`, '_blank');
        });
    });
