//server

const webpush = require('web-push');

// VAPID keys
const publicVapidKey = '<your public key here>';
const privateVapidKey = '<your private key here>';

webpush.setVapidDetails('mailto:your@email.com', publicVapidKey, privateVapidKey);

// Subscribe Route
app.post('/subscribe', (req, res) => {
    // Get pushSubscription object
    const subscription = req.body;

    // Send 201 - resource created
    res.status(201).json({});

    // Create payload
    const payload = JSON.stringify({ title: 'Push Test' });

    // Pass object into sendNotification
    webpush
        .sendNotification(subscription, payload)
        .catch(err => console.error(err));
});




// Client-side (React.js):


import { useEffect } from 'react';

function App() {
    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered');
                })
                .catch(err => console.log(`Service Worker error: ${err}`));
        }

        // Request for notification permission
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    subscribeUser();
                }
            });
        }
    }, []);

    // Subscribe user
    const subscribeUser = () => {
        // Get service worker registration
        navigator.serviceWorker.ready.then(registration => {
            // Get push subscription object
            registration.pushManager
                .subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: '<your public key here>'
                })
                .then(subscription => {
                    // Send subscription object to server
                    fetch('/subscribe', {
                        method: 'POST',
                        body: JSON.stringify(subscription),
                        headers: {
                            'content-type': 'application/json'
                        }
                    });
                });
        });
    };

    return (
        <div>
            <h1>Push Notifications Example</h1>
        </div>
    );
}

export default App;




// Service worker (sw.js):
self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received');
    self.registration.showNotification(data.title, {
        body: 'Notified by React App',
        icon: '/src/icon.png'
    });
});
