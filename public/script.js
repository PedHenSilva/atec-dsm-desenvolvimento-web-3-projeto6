// Máscaras de entrada em tempo real
export function mascararTelefone(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    
    if (v.length > 6) {
        input.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    } else if (v.length > 2) {
        input.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    } else {
        input.value = v;
    }
}

export function mascararCEP(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 8) v = v.substring(0, 8);
    
    if (v.length > 5) {
        input.value = `${v.substring(0, 5)}-${v.substring(5)}`;
    } else {
        input.value = v;
    }
}

// Exibição de alertas temporários customizados
export function exibirMensagem(idElemento, texto, corFundo) {
    const msgDiv = document.getElementById(idElemento);
    if (!msgDiv) return;
    msgDiv.innerText = texto;
    msgDiv.style.background = corFundo;
    msgDiv.style.color = '#fff';
    msgDiv.style.display = 'block';
    setTimeout(() => msgDiv.style.display = 'none', 4000);
}
