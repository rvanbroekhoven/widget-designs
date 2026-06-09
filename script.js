        // Update dynamische footer "Nog X taken open"
        function updateTaskCounts() {
            document.querySelectorAll('.w-card').forEach(card => {
                const titleEl = card.querySelector('.w-title');
                if(titleEl && titleEl.innerText === 'TITEL WERKZAAMHEDEN') {
                    const total = card.querySelectorAll('.editor-check-toggle').length;
                    const checked = card.querySelectorAll('.editor-check-toggle.checked').length;
                    const open = total - checked;
                    const footer = card.querySelector('.task-footer');
                    
                    if(footer) {
                        if(open === 0) {
                            footer.innerText = 'Geen taken open';
                        } else if(open === 1) {
                            footer.innerText = 'Nog 1 taak open';
                        } else {
                            footer.innerText = `Nog ${open} taken open`;
                        }
                    }
                }
            });
        }

        // Initieer telling
        updateTaskCounts();

        // Checkbox Functionaliteit inclusief hertelling
        document.querySelectorAll('.editor-check-toggle').forEach(item => {
            const checkbox = item.querySelector('.check-box');
            if(checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation(); // Zorg dat de modal niet opent bij het vinken
                    item.classList.toggle('checked');
                    checkbox.innerHTML = item.classList.contains('checked') ? '✓' : '';
                    updateTaskCounts(); // Tel opnieuw!
                });
            }
        });
        
        // Tab Navigatie inclusief content wissel voor Tekst widget
        document.querySelectorAll('.w-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                let parent = e.target.parentElement;
                parent.querySelectorAll('.w-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                const targetId = e.target.getAttribute('data-target');
                if(targetId) {
                    const card = e.target.closest('.w-card');
                    card.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
                    const targetContent = card.querySelector('#' + targetId);
                    if(targetContent) {
                        targetContent.style.display = 'flex'; 
                    }
                }
            });
        });

        // Modal Functies

        function openTaskModal(taskText, addedBy, assignedTo) {
            document.getElementById('task-detail-text').innerText = taskText;
            document.getElementById('task-detail-adder').innerText = addedBy;
            document.getElementById('task-detail-assignee').innerText = assignedTo;
            document.getElementById('task-detail-modal').classList.add('active');
        }

        function openTableModal(desc, time, loc, status) {
            document.getElementById('table-detail-text').innerText = desc;
            document.getElementById('table-detail-time').innerText = time;
            document.getElementById('table-detail-loc').innerText = loc;
            document.getElementById('table-detail-status').innerText = status;
            document.getElementById('table-detail-modal').classList.add('active');
        }

        // =========================================
        // DATEPICKER LOGICA (FLATPICKR)
        // =========================================
        const dateTrigger = document.querySelector('.bb-date-trigger');
        let currentDate = new Date();

        const fp = flatpickr(dateTrigger, {
            locale: "nl",
            dateFormat: "d-m-Y",
            defaultDate: currentDate,
            position: "above center", /* FIX: Forceert de kalender naar boven */
            onChange: function(selectedDates, dateStr) {
                if(selectedDates[0]) {
                    currentDate = selectedDates[0];
                    updateDateDisplay();
                }
            },
            onReady: function(selectedDates, dateStr, instance) {
                // 1. Maak custom header (met exact dezelfde pijltjes voor maand én jaar)
                const customHeader = document.createElement('div');
                customHeader.className = 'custom-header-bg';
                customHeader.innerHTML = `
                    <div class="c-month-group">
                        <button type="button" class="c-arrow prev-month">&#8249;</button>
                        <span class="c-val month-val"></span>
                        <button type="button" class="c-arrow next-month">&#8250;</button>
                    </div>
                    <div class="c-year-group">
                        <button type="button" class="c-arrow prev-year">&#8249;</button>
                        <span class="c-val year-val"></span>
                        <button type="button" class="c-arrow next-year">&#8250;</button>
                    </div>
                `;

                const updateCustomHeader = () => {
                    const months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
                    customHeader.querySelector('.month-val').innerText = months[instance.currentMonth];
                    customHeader.querySelector('.year-val').innerText = instance.currentYear;
                };

                // Pijltjes functies
                customHeader.querySelector('.prev-month').addEventListener('click', e => { e.stopPropagation(); instance.changeMonth(-1); updateCustomHeader(); });
                customHeader.querySelector('.next-month').addEventListener('click', e => { e.stopPropagation(); instance.changeMonth(1); updateCustomHeader(); });
                customHeader.querySelector('.prev-year').addEventListener('click', e => { e.stopPropagation(); instance.changeYear(instance.currentYear - 1); updateCustomHeader(); });
                customHeader.querySelector('.next-year').addEventListener('click', e => { e.stopPropagation(); instance.changeYear(instance.currentYear + 1); updateCustomHeader(); });

                instance.calendarContainer.prepend(customHeader);
                instance.config.onMonthChange.push(updateCustomHeader);
                instance.config.onYearChange.push(updateCustomHeader);
                updateCustomHeader();

                // 2. Maak de "Terug naar Vandaag" knop onderaan
                const todayBtn = document.createElement('button');
                todayBtn.className = 'flatpickr-today-btn';
                todayBtn.innerText = 'Vandaag';
                todayBtn.addEventListener('click', () => {
                    instance.setDate(new Date(), true);
                    instance.close();
                });
                instance.calendarContainer.appendChild(todayBtn);
            }
        });

        // Update de tekst op de hoofdknop 
        function updateDateDisplay() {
            const today = new Date();
            const isToday = currentDate.getDate() === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            
            if (isToday) {
                dateTrigger.innerText = "Vandaag";
            } else {
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                dateTrigger.innerText = currentDate.toLocaleDateString('nl-NL', options);
            }
        }

        // 3. Laat de buitenste pijltjes naast de 'Vandaag' knop 1 dag per klik skippen
        const navArrows = document.querySelectorAll('.bb-nav-arrow');
        if(navArrows.length >= 2) {
            navArrows[0].addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() - 1);
                fp.setDate(currentDate, true);
            });
            navArrows[1].addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() + 1);
                fp.setDate(currentDate, true);
            });
        }

        // --- KAZERNE SELECTIE LOGICA ---
        const locBtn = document.getElementById('loc-btn');
        const locWrap = document.getElementById('loc-wrap');
        const locLabel = document.getElementById('loc-label');
        const piketToggle = document.getElementById('piket-toggle');
        const piketWrap = document.getElementById('piket-wrap');

        // Open/sluit hoofdmenu
        if(locBtn) {
            locBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                locWrap.classList.toggle('open');
            });
        }

        // Open/sluit Piket submenu
        if(piketToggle) {
            piketToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                piketWrap.classList.toggle('open');
            });
        }

        // Selecteer locatie en update label
        document.querySelectorAll('.loc-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const val = item.getAttribute('data-val');
                if(locLabel) locLabel.innerText = val;
                
                // Active state updaten
                document.querySelectorAll('.loc-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                // Sluit menu
                locWrap.classList.remove('open');
            });
        });

        // Sluit menu bij klik buiten het menu
        document.addEventListener('click', (e) => {
            if (locWrap && !locWrap.contains(e.target)) {
                locWrap.classList.remove('open');
            }
        });
        // --- FULL-SCREEN GALERIJ LOGICA ---
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    const photoModal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const photoCounter = document.getElementById('photo-counter');

    // 1. Koppel de klik-actie aan jouw bestaande knop
    document.querySelectorAll('.open-gallery-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Lees de lijst met foto's uit het data-gallery attribuut
            const galleryData = btn.getAttribute('data-gallery');
            if (galleryData) {
                currentGalleryImages = JSON.parse(galleryData); // Zet de tekst om naar een lijst
                currentImageIndex = 0; // Begin ALTIJD bij de eerste foto
                
                updateGalleryView();
                photoModal.classList.add('active'); // Open de pop-up
            }
        });
    });

    // 2. Functie om de foto en teller bij te werken
    function updateGalleryView() {
        modalImg.src = currentGalleryImages[currentImageIndex];
        photoCounter.innerText = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
    }

    // 3. Pijltje naar rechts (Volgende)
    document.getElementById('next-photo').addEventListener('click', (e) => {
        e.stopPropagation();
        // Tel 1 op bij de index. Gebruik modulo (%) om weer bij 0 te beginnen als we bij het einde zijn.
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        updateGalleryView();
    });

    // 4. Pijltje naar links (Vorige)
    document.getElementById('prev-photo').addEventListener('click', (e) => {
        e.stopPropagation();
        // Trek 1 af. Voeg de totale lengte toe om min-getallen te voorkomen, en doe dan modulo.
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateGalleryView();
    });

    // 5. Modal sluiten via het kruisje of door ernaast te klikken
    document.getElementById('close-photo').addEventListener('click', () => {
        photoModal.classList.remove('active');
    });

    photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) {
            photoModal.classList.remove('active');
        }
    });
    // =========================================
    // FIX 2: MAAK SIZE L & MODAL FOTO'S WERKEND
    // =========================================
    
    // 1. Vangt de oude onclick="" acties uit de HTML geruisloos op zodat er geen errors ontstaan
    window.openPhotoModal = function() {}; 

    // 2. Koppel de nieuwe galerij logica automatisch aan alle oude '.w-photo-thumb' knoppen
    document.querySelectorAll('.w-photo-thumb').forEach(thumb => {
        // Alleen toepassen op de thumbnails die nog géén 'open-gallery-btn' class hebben
        if(!thumb.classList.contains('open-gallery-btn')) {
            thumb.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Zoek alle foto's binnen hetzelfde kader (grid)
                const grid = thumb.closest('.w-photo-grid');
                if(grid) {
                    const allThumbs = Array.from(grid.querySelectorAll('.w-photo-thumb'));
                    
                    // Bepaal op de hoeveelste foto er is geklikt
                    currentImageIndex = allThumbs.indexOf(thumb);
                    
                    // Genereer een lijstje met dummy foto-links gebaseerd op het aantal thumbs
                    currentGalleryImages = allThumbs.map((_, i) => `img/content-${i+1}.jpg`);
                    
                    // Open de galerij op de juiste plek
                    updateGalleryView();
                    photoModal.classList.add('active');
                }
            });
        }
    });

        // --- TABEL KOLOM SELECTIE LOGICA ---
        // 1. Openen/Sluiten van het dropdown menu
        document.querySelectorAll('.col-select-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const wrap = trigger.closest('.col-select-wrap');
                
                // Sluit eventuele andere open menu's
                document.querySelectorAll('.col-select-wrap').forEach(w => {
                    if (w !== wrap) w.classList.remove('open');
                });
                wrap.classList.toggle('open');
            });
        });

        // Sluit het menu als je ergens anders klikt
        document.addEventListener('click', () => {
            document.querySelectorAll('.col-select-wrap').forEach(w => w.classList.remove('open'));
        });

        // 2. Het aan- en uitzetten van de kolommen
        document.querySelectorAll('.col-select-menu').forEach(menu => {
            menu.addEventListener('click', e => e.stopPropagation()); // Zorgt dat het menu niet ongewenst sluit
            
            menu.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    const colType = checkbox.getAttribute('data-col');
                    const isChecked = checkbox.checked;
                    const card = checkbox.closest('.w-card');

                    // A. Uitzondering voor Waarschuwingen (Werkt anders dan tabellen)
                    if (['mwb', 'zls', 'knmi', 'waarschuwingen'].includes(colType)) {
                        card.querySelectorAll('.toggle-' + colType).forEach(el => {
                            if (isChecked) el.classList.remove('hide-element');
                            else el.classList.add('hide-element');
                        });
                        
                        const mwb = card.querySelector('.toggle-mwb');
                        const zls = card.querySelector('.toggle-zls');
                        if (mwb && zls) {
                            if (mwb.classList.contains('hide-element')) {
                                zls.style.borderTop = 'none'; zls.style.paddingTop = '0';
                            } else {
                                zls.style.borderTop = card.classList.contains('size-mobile') ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--input-border)';
                                zls.style.paddingTop = card.classList.contains('size-mobile') ? '14px' : (card.classList.contains('size-l') ? '12px' : '10px');
                            }
                        }

                        card.querySelectorAll('.natuurbrand-container').forEach(container => {
                            const hasVisible = Array.from(container.querySelectorAll('.toggle-mwb, .toggle-zls')).some(el => !el.classList.contains('hide-element'));
                            if (hasVisible) container.classList.remove('hide-element');
                            else container.classList.add('hide-element');
                        });

                        card.querySelectorAll('.weer-container').forEach(container => {
                            const hasVisible = Array.from(container.querySelectorAll('.toggle-knmi, .toggle-waarschuwingen')).some(el => !el.classList.contains('hide-element'));
                            if (hasVisible) container.classList.remove('hide-element');
                            else container.classList.add('hide-element');
                        });
                        return; // Stop script hier voor de waarschuwingen widget
                    }

                    // B. Universele Toggle voor Tabellen (Slimme check voor verschillende benamingen)
                    const baseCol = colType.replace('col-', '');
                    
                    card.querySelectorAll(`.toggle-${baseCol}, .toggle-col-${baseCol}`).forEach(el => {
                        if (isChecked) el.classList.remove('hide-element');
                        else el.classList.add('hide-element');
                    });

                    // C. Fallback: als de 4 details (W/B/A/AB) uit staan bij Voertuigen, verberg de hoofdkolom
                    if (['detail-w', 'detail-b', 'detail-a', 'detail-ab'].includes(baseCol)) {
                        const detailWrappers = card.querySelectorAll('.toggle-col-details, .toggle-details');
                        const anyChecked = Array.from(card.querySelectorAll('input[data-col^="detail-"]')).some(cb => cb.checked);
                        
                        detailWrappers.forEach(wrap => {
                            if(anyChecked) wrap.classList.remove('hide-element');
                            else wrap.classList.add('hide-element');
                        });
                    }

                    // D. Fix voor Tabel-opmaak als de Datum-kolom verdwijnt
                    const table = card.querySelector('.data-table');
                    if (table && baseCol === 'tijd') {
                        if (!isChecked) table.classList.add('no-time-col');
                        else table.classList.remove('no-time-col');
                    }
                });
            });
        });

        // --- EVENEMENTEN MODAL POPUP LOGICA ---
        function openEventModal(title, location, persons, ops, start, end, contact) {
            document.getElementById('event-detail-title').innerText = title;
            document.getElementById('event-detail-location').innerText = "Locatie: " + location;
            document.getElementById('event-detail-persons').innerText = "Aantal personen: " + persons;
            document.getElementById('event-detail-ops').innerText = "Operationele gegevens: " + ops;
            document.getElementById('event-detail-start').innerText = "Evenement Start: " + start;
            document.getElementById('event-detail-end').innerText = "Eind: " + end;
            document.getElementById('event-detail-contact').innerText = "Contact gegevens: " + contact;
            document.getElementById('event-detail-modal').classList.add('active');
        }

        // --- TOPDESK MODAL POPUP LOGICA ---
        function openTopdeskModal(nummer, aangemaakt, ruimteLbl, ruimteVal, korteDesc, langeDesc, streef, status, naam) {
            document.getElementById('td-modal-title').innerText = nummer;
            document.getElementById('td-modal-lange-desc').innerText = langeDesc;
            document.getElementById('td-modal-aangemaakt').innerText = aangemaakt;
            document.getElementById('td-modal-ruimte-lbl').innerText = ruimteLbl;
            document.getElementById('td-modal-ruimte').innerText = ruimteVal;
            document.getElementById('td-modal-streef').innerText = streef;
            document.getElementById('td-modal-status').innerText = status;
            document.getElementById('td-modal-naam').innerText = naam;
            document.getElementById('topdesk-detail-modal').classList.add('active');
        }

        // Trigger voor de sub-modal met downloadbare documenten
            document.getElementById('download-docs-trigger').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('event-download-modal').classList.add('active');
        });

        // --- INTERACTIEVE UI KIT PROFIEL LOGICA ---
        const uiTrigger = document.getElementById('ui-profile-trigger');
        const uiPanel = document.getElementById('ui-profile-panel');
        const uiWrapper = document.getElementById('ui-profile-wrapper');
        const uiSaveBtn = document.getElementById('ui-profile-save');

        if (uiTrigger && uiPanel) {
            // Panel openen en sluiten
            uiTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = uiPanel.style.display === 'block';
                uiPanel.style.display = isOpen ? 'none' : 'block';
            });

            // Voorkom dat klikken binnen het panel de dropdown sluit
            uiPanel.addEventListener('click', (e) => e.stopPropagation());

            // Sluit dropdown als er ergens anders op het scherm wordt geklikt
            document.addEventListener('click', (e) => {
                if (uiWrapper && !uiWrapper.contains(e.target)) {
                    uiPanel.style.display = 'none';
                }
            });

            // Opslaan knop sluit het panel (Nu op de juiste plek!)
            if (uiSaveBtn) {
                uiSaveBtn.addEventListener('click', () => {
                    uiPanel.style.display = 'none';
                });
            }
        }

        // --- THEMA & ACHTERGROND LOGICA (GEKOPPELD AAN PROFIEL MENU) ---
        const themeToggle = document.getElementById('ui-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const isDark = this.getAttribute('aria-checked') === 'true';
                this.setAttribute('aria-checked', !isDark ? 'true' : 'false');
                document.body.setAttribute('data-theme', !isDark ? 'dark' : 'light');
            });
        }

        const bgMenu = document.getElementById('ui-bg-menu');
        if (bgMenu) {
            bgMenu.querySelectorAll('.bg-thumb').forEach(thumb => {
                thumb.addEventListener('click', (e) => {
                    e.stopPropagation(); // Voorkomt dat het hele profiel menu ongewenst sluit
                    bgMenu.querySelectorAll('.bg-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    
                    const bg = thumb.getAttribute('data-bg');
                    if (bg === 'none') {
                        document.body.style.backgroundImage = 'none';
                    } else {
                        document.body.style.backgroundImage = bg;
                        document.body.style.backgroundSize = 'cover';
                        document.body.style.backgroundPosition = 'center';
                        document.body.style.backgroundAttachment = 'fixed';
                    }
                });
            });
        }

        // --- TAB LOGICA VOOR HET PROFIEL MENU ---
        document.querySelectorAll('.pp-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Active state van de tabs updaten
                const tabsContainer = tab.closest('.pp-tabs');
                tabsContainer.querySelectorAll('.pp-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Alle content verbergen en de gekozen tab content tonen
                const panel = tab.closest('.profile-panel');
                panel.querySelectorAll('.pp-tab-content').forEach(c => c.classList.remove('active'));
                
                const targetId = tab.getAttribute('data-target');
                panel.querySelector('#' + targetId).classList.add('active');
            });
        });

        // --- GENERIEK DETAIL MODAL (info-icoon) ---
        function openDetailModal(title, rows) {
            document.getElementById('generic-detail-modal-title').innerText = title;
            const body = document.getElementById('generic-detail-modal-body');
            body.innerHTML = rows.map(([lbl, val]) =>
                `<div class="detail-modal-row">
                    <span class="detail-modal-lbl">${lbl}</span>
                    <span class="detail-modal-val">${val}</span>
                </div>`
            ).join('');
            document.getElementById('generic-detail-modal').classList.add('active');
        }

        // --- INCIDENTEN MOBIEL: rij uitklappen ---
        function toggleIncRow(row) {
            const next = row.nextElementSibling;
            if (!next || !next.classList.contains('inc-expand-row')) return;
            const isOpen = next.style.display === 'table-row';
            // Sluit alle andere expand-rows in dezelfde tabel
            row.closest('table').querySelectorAll('.inc-expand-row').forEach(r => r.style.display = 'none');
            if (!isOpen) next.style.display = 'table-row';
        }

        // --- OEFENMOMENTEN TABS LOGICA ---
        function switchOefenTab(clickedTab, targetId) {
            const tabsContainer = clickedTab.parentElement;
            tabsContainer.querySelectorAll('.oefen-tab').forEach(t => t.classList.remove('active'));
            clickedTab.classList.add('active');
            const card = clickedTab.closest('.w-card');
            card.querySelectorAll('.oefen-tab-content').forEach(c => c.classList.remove('active'));
            const target = card.querySelector('#' + targetId);
            if (target) target.classList.add('active');
        }

        // --- WIDGET INTERNE TABS LOGICA (VERBETERD) ---
            document.querySelectorAll('.w-tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const row = btn.closest('.w-tabs-row');
                    const card = btn.closest('.w-card');
                    const target = btn.getAttribute('data-target');
                    
                    // Update knoppen status
                    row.querySelectorAll('.w-tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Wissel de juiste content div binnen deze widget af
                    if (target && card) {
                        card.querySelectorAll('.v-tab-content').forEach(c => {
                            c.classList.remove('active');
                        });
                        const targetContent = card.querySelector('.v-tab-content.' + target);
                        if (targetContent) targetContent.classList.add('active');
                    }
                });
            });

