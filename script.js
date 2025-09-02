document.addEventListener('DOMContentLoaded', function() {

    // Přepínání sekcí v menu
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Nastavení aktivního menu na "DOMŮ" a zobrazení úvodní sekce
    const defaultLink = document.querySelector('.nav-link[data-target="domu"]');
    const defaultSection = document.getElementById('domu');
    if(defaultLink) {
        defaultLink.classList.add('active-menu');
    }
    if(defaultSection) {
        defaultSection.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            const targetId = this.getAttribute('data-target');
            
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            navLinks.forEach(nav => nav.classList.remove('active-menu'));
            this.classList.add('active-menu');
        });
    });

    // Animace střelby puku při kliknutí
    document.addEventListener('click', function(e) {
        const puk = document.createElement('div');
        puk.classList.add('puk-shot');
        document.body.appendChild(puk);

        // Pozice puku na místě kliknutí
        puk.style.left = e.clientX + 'px';
        puk.style.top = e.clientY + 'px';

        // Odstranění puku po skončení animace
        puk.addEventListener('animationend', () => {
            puk.remove();
        });
    });

    // Měnící se pozadí při rolování
    const bgImages = document.querySelectorAll('.bg-image');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const bodyHeight = document.body.scrollHeight;
        const windowHeight = window.innerHeight;
        const totalContentHeight = bodyHeight - windowHeight;
        const sectionHeight = totalContentHeight / (bgImages.length - 1);

        // Cyklicky mění pozadí na základě pozice rolování
        let activeIndex = 0;
        if (totalContentHeight > 0) {
            activeIndex = Math.floor(scrollPosition / sectionHeight);
            if (activeIndex >= bgImages.length) {
                activeIndex = bgImages.length - 1;
            }
        }
        
        bgImages.forEach((img, index) => {
            if (index === activeIndex) {
                img.style.opacity = 1;
            } else {
                img.style.opacity = 0;
            }
        });

        lastScrollY = scrollPosition;
    });

    // Data pro hlasování
    const hlasovaniData = {
        'zapas-datum': {
            votes: {},
            chartInstance: null
        },
        'jidlo': {
            votes: {},
            chartInstance: null
        }
    };

    // Funkce pro nalezení vítěze
    function findWinner(pollId) {
        const data = hlasovaniData[pollId];
        let winner = null;
        let maxVotes = 0;

        for (const volba in data.votes) {
            if (data.votes[volba].length > maxVotes) {
                maxVotes = data.votes[volba].length;
                winner = volba;
            }
        }
        return { option: winner, votes: maxVotes };
    }

    // Funkce pro vykreslení tabulky vítězů
    function renderWinnerTable(pollId) {
        const winner = findWinner(pollId);
        const tbody = document.getElementById(`vyherni-tabulka-${pollId}`).querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (winner.option) {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${winner.option}</td><td>${winner.votes}</td>`;
            tbody.appendChild(row);
        }
    }

    // Funkce pro vykreslení grafu
    function renderChart(pollId) {
        const data = hlasovaniData[pollId];
        const canvas = document.getElementById(`graf-${pollId}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const labels = Object.keys(data.votes);
        const voteCounts = labels.map(label => data.votes[label].length);

        if (data.chartInstance) {
            data.chartInstance.data.labels = labels;
            data.chartInstance.data.datasets[0].data = voteCounts;
            data.chartInstance.update();
        } else {
            data.chartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Počet hlasů',
                        data: voteCounts,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#fff',
                            }
                        },
                        tooltip: {
                             callbacks: {
                                 label: function(context) {
                                     let label = context.label || '';
                                     let value = context.parsed;
                                     return `${label}: ${value} hlasů`;
                                 }
                             }
                         }
                    }
                }
            });
        }
    }

    // Funkce pro vykreslení tabulky
    function renderTable(pollId) {
        const data = hlasovaniData[pollId];
        const tbody = document.getElementById(`tabulka-${pollId}`).querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = ''; 

        for (const volba in data.votes) {
            data.votes[volba].forEach(jmeno => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${jmeno}</td><td>${volba}</td>`;
                tbody.appendChild(row);
            });
        }
    }

    // Inicializace na začátku
    renderChart('zapas-datum');
    renderTable('zapas-datum');
    renderWinnerTable('zapas-datum');
    renderChart('jidlo');
    renderTable('jidlo');
    renderWinnerTable('jidlo');

    // Logika hlasování
    document.querySelectorAll('.hlasovani-volby button').forEach(button => {
        button.addEventListener('click', function() {
            const jmeno = prompt("Zadejte své jméno:");
            if (!jmeno || jmeno.trim() === '') {
                alert("Hlasování zrušeno nebo nebylo zadáno jméno.");
                return;
            }

            const volba = this.getAttribute('data-value');
            const pollId = this.parentElement.getAttribute('data-poll-id');
            const data = hlasovaniData[pollId];

            for (const volbaKey in data.votes) {
                data.votes[volbaKey] = data.votes[volbaKey].filter(hrac => hrac !== jmeno);
            }

            if (!data.votes[volba]) {
                data.votes[volba] = [];
            }
            data.votes[volba].push(jmeno.trim());

            renderChart(pollId);
            renderTable(pollId);
            renderWinnerTable(pollId);
        });
    });
    
    // Logika pro tlačítka resetování
    document.querySelectorAll('.reset-button').forEach(button => {
        button.addEventListener('click', function() {
            const pollId = this.getAttribute('data-poll-id');
            const data = hlasovaniData[pollId];
            data.votes = {};
            if (data.chartInstance) {
                data.chartInstance.destroy();
                data.chartInstance = null;
            }
            renderChart(pollId);
            renderTable(pollId);
            renderWinnerTable(pollId);
        });
    });
});
