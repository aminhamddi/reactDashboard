class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(plant = 'ALL') {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket déjà connecté ou en cours de connexion');
            return;
        }

        // Auto-detect WebSocket URL from current page location
        const wsHost = import.meta.env.VITE_WS_HOST || window.location.hostname;
        const wsPort = window.location.port ? `:${window.location.port}` : ':8000';
        const wsProtocol = 'ws:';
        const wsUrl = `${wsProtocol}//${wsHost}${wsPort}/ws/${plant}`;
        console.log(`Connexion WebSocket Dashboard à : ${wsUrl}`);

        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('Dashboard WebSocket connecté');
                this.reconnectAttempts = 0;
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Message WebSocket reçu:', data);

                    if (data.type === 'AUDIT_FINALIZED') {
                        this.emit('auditFinalized', data.data || data);
                    } else if (data.type === 'ACTION_ASSIGNED') {
                        this.emit('actionAssigned', data.data || data);
                    } else {
                        this.emit(data.type, data.data || data);
                    }
                } catch (e) {
                    console.warn('Erreur parsing message WebSocket:', e);
                }
            };

            this.socket.onclose = (event) => {
                console.log('Dashboard WebSocket déconnecté:', event.reason);

                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = 2000 * this.reconnectAttempts;
                    console.log(`Reconnexion Dashboard dans ${delay/1000}s...`);
                    setTimeout(() => this.connect(plant), delay);
                }
            };

            this.socket.onerror = (error) => {
                console.error('Erreur WebSocket Dashboard:', error);
            };

        } catch (error) {
            console.error('Erreur création WebSocket:', error);
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
            this.listeners.set(event, callbacks);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

const wsService = new WebSocketService();
export default wsService;
