const merchantId = '4f7c12c4-b17c-4b5d-8a71-e26f8513b690';
const app = new Vue({
    el: '#app',
    data: {
        title: 'Simple SMS API Client',
        name: '',
        text: '',
        messages: [],
        socket: null
    },
    methods: {
        sendMessage() {
            if(this.validateInput()) {
                const message = {
                    name: this.name,
                    text: this.text
                }
                this.socket.emit('event', message)
                this.text = ''
            }
        },
        receivedMessage(message) {
            this.messages.push(message)
        },
        validateInput() {
            return this.name.length > 0 && this.text.length > 0
        }
    },
    created() {
        this.socket = io('https://sms.api.oltranz.com')
        this.socket.on('status-6a441e15-13a7-4cb3-9a34-7bfbabe1d137', (message) => {
            this.receivedMessage(message)
        })

        this.socket.on('status-82d5ee5a-f02c-46fd-a7e7-80782f800d99', (message) => {
            this.receivedMessage(message)
        })
    }
})