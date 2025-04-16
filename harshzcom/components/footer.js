

export default function renderFooter() {
    document.getElementById('footer').innerHTML = 
    `<footer class="footer">
        <p>&copy; ${new Date().getFullYear()} Harsh Langeh. All rights reserved.</p>
    </footer>`
}