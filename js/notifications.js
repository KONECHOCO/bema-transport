/**
 * BEMA TRANSPORT - Centre de Notifications & Alertes en Temps Réel
 */

class BemaNotifications {
    constructor() {
        this.isOpen = false;
    }

    init() {
        this.updateBadge();
        this.renderPanelList();
    }

    togglePanel() {
        const panel = document.getElementById('notificationsPanel');
        if (!panel) return;

        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            panel.classList.add('active');
            this.renderPanelList();
        } else {
            panel.classList.remove('active');
        }
    }

    closePanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.classList.remove('active');
            this.isOpen = false;
        }
    }

    updateBadge() {
        const badge = document.getElementById('notifBadgeCount');
        const count = window.bemaStorage.getUnreadNotifsCount();

        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    renderPanelList() {
        const listContainer = document.getElementById('notificationsList');
        if (!listContainer) return;

        const notifs = window.bemaStorage.getNotifications();

        if (notifs.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-notifs">
                    <i class="fa-regular fa-bell-slash"></i>
                    <p>Aucune notification pour le moment.</p>
                </div>
            `;
            return;
        }

        let html = '';
        notifs.forEach(n => {
            let icon = 'fa-solid fa-bell';
            let typeClass = 'type-info';

            if (n.type === 'warning' || n.type === 'delay') {
                icon = 'fa-solid fa-triangle-exclamation';
                typeClass = 'type-warning';
            } else if (n.type === 'ticket_success') {
                icon = 'fa-solid fa-circle-check';
                typeClass = 'type-success';
            } else if (n.type === 'welcome') {
                icon = 'fa-solid fa-bullhorn';
                typeClass = 'type-primary';
            }

            html += `
                <div class="notif-item ${n.read ? 'read' : 'unread'} ${typeClass}">
                    <div class="notif-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notif-content">
                        <h5>${n.title}</h5>
                        <p>${n.message}</p>
                        <span class="notif-time"><i class="fa-regular fa-clock"></i> ${n.time}</span>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
        this.updateBadge();
    }

    markAllAsRead() {
        window.bemaStorage.markAllNotificationsRead();
        this.renderPanelList();
        this.updateBadge();
        this.showToast("Toutes les notifications sont marquées comme lues.", "info");
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;

        let icon = 'fa-solid fa-circle-info';
        if (type === 'success') icon = 'fa-solid fa-circle-check';
        if (type === 'warning') icon = 'fa-solid fa-triangle-exclamation';

        toast.innerHTML = `
            <div class="toast-icon"><i class="${icon}"></i></div>
            <div class="toast-body">${message}</div>
            <button type="button" class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4500);
    }
}

window.bemaNotifications = new BemaNotifications();
