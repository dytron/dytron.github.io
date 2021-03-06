// Elementos
var matrizE = document.getElementById("matriz");
var vetorE = document.getElementById("vetor");
var toleranciaE = document.getElementById("tolerancia");
var executarE = document.getElementById("executar");
var ex1 = document.getElementById("ex1");
var ex2 = document.getElementById("ex2");
var resultadoE = document.getElementById("resultado");
var resultado2E = document.getElementById("resultado2");
var passosE = document.getElementById("passos");
var saidaE = document.getElementById("saida");

executarE.addEventListener('click', ()=>{
    let A, v0, eps, resultado;
    A = Input.stringToMatrix(matrizE.value);
    v0 = Matrix.fromArray(Input.stringToArray(vetorE.value));
    eps = math.evaluate(tolerancia.value);
    if (A?.length == 0 || v0?.length == 0) {
        passosE.innerHTML = "Entrada Inválida!";
        return;
    }
    resultado = Metodo.potenciaInversa(A, v0, eps);
    resultadoE.value = resultado.eigenvalue;
    resultado2E.value = resultado.eigenvector.join("\n");
    resultado2E.rows = resultado.eigenvector.length;
    passosE.innerHTML = "Número de passos: " + resultado.passos.toString();
    saidaE.setAttribute("style", "display: inline-block;");
    AutoResize(resultado2E);
});
// Exemplos de Entrada
ex1.addEventListener('click', ()=>{
    matrizE.value = 
`5, 2, 1
2, 3, 1
1, 1, 2`;
    vetorE.value = "1, 1, 1";
    AutoResize(matrizE);
});
ex2.addEventListener('click', ()=>{
    matrizE.value = 
`40, 8, 4, 2, 1
8, 30, 12, 6, 2
4, 12, 20, 1, 2
2, 6, 1, 25, 4
1, 2, 2, 4, 5`;
    vetorE.value = "1, 1, 1, 1, 1";
    AutoResize(matrizE);
});

// Auto-resize
const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
    AutoResize(this);
}
function AutoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = (textarea.scrollHeight) + "px";
}
Theme.init();