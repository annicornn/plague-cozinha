$(document).ready(function () {

    //socket = io faz a conexão com o servidor  
    const socket = io('http://10.11.1.97:9000');	
    //socket on envio para a marininha maravilhosa (servidor)
    socket.on('estado-atual', function (faseRecebida) {

        console.log('faseRecebida');
        console.log(faseRecebida);

        faseAtual = faseRecebida.faseAtual;
        finalizado = faseRecebida.finalizado;
        $('.selecionado').removeClass("selecionado");
        //botao fica verde mostrando a fase atual  
        var btnId = "btn-" + faseAtual;
        $('#' + btnId).addClass("selecionado");
    });

    setTimeout(function () {
        console.log("teste");
        socket.emit('estado-atual');
    }, 1000);

    var logAtividades = [];
    var usersLogados = [];
    var userLogado = { id: 0 };
    //contador da fase atual
    var faseAtual = 0;
    //se a fase for finalizada retorna true
    var finalizado = false;
    //array de fases exibidas no html
    todasAsFases = [{
        id: 0,
        nome: 'Fase 0 - Aceite',
    },
    {
        id: 1,
        nome: 'Fase 1 - Botão',
    },
    {
        id: 2,
        nome: 'Fase 2 - Molécula',
    },
    {
        id: 3,
        nome: 'Fase 3 - Tubos',
    },
    {
        id: 4,
        nome: 'Fase 4 - Código',
    },
    {
        id: 5,
        nome: 'Fase 5 - Bomba',
    }]

    //mudafase muda a fase toda as vezes que clico em algum botao
    function mudaFase(faseId) {
        //socket.emit recebo algo da marina (servidor)
            socket.emit('muda-fase', faseId);
            socket.emit('estado-atual');
    };
    //forEach percorre o array de fases

    todasAsFases.forEach(fase => {
        var faseId = "fase-" + fase.id;
        var btnId = "btn-" + fase.id;
        var certo = "✅";
        var errado = "❌";
        // var confId = "conf-" + fase.id;

        //append vai adicionar elementos da fase (id, nome , botões) dentro da minha ul no html
        $('#todas-fases').append(`
        <li id="${faseId}">
        <p>${fase.nome}</p>
        <button id="${btnId}">Muda fase ${fase.id}</button>
        </li>`
        );
        //botao para mudar a fase
        $('#' + btnId).click(function () {
            if (confirm("Deseja realmente mudar de fase?")) {
                console.log('mudou de fase');
                socket.emit('muda-fase', fase.id);
                socket.emit('estado-atual');
            }
        });
    });

    //recebo Iniciação do servidor    
    $('#init').click(function () {
        socket.emit('init');
    });

    $('#fail').click(function () {
        console.log("FAIL");
        socket.emit('fail');
    });

    socket.on('dica', function (dica) {
        console.log('chegou dica');
        console.log(dica);
    });
    //recebo usuários do servidor
    socket.emit('users');

    /*-----------------------------------------------------------------------*/
    /*-----------------------------SOCKET.ON---------------------------------*/
    /*-----------------------------------------------------------------------*/

    //envio essa função para o servidor
    socket.on('users', function (users) {

        var pstyle;
        var styleOn = 'background-color: rgb(121, 184, 121)';
        var styleOff = 'background-color: rgb(228, 133, 133)';
        usersLogados = [];

        $('#users').html('');
        //percorro o array de usuários
        users.forEach(user => {
            console.log('user')
            console.log(user)

            //verifica se o usuário está online e troca a cor do background para verde
            if (user.socketId == '') {
                pStyle = styleOff;
            } else {
                pStyle = styleOn;
                usersLogados.push(user.id)
            }

            var botId = 'botId-' + user.id;
            var dica1 = 'dica1-' + user.id;
            var dica2 = 'dica2-' + user.id;
            var dica3 = 'dica3-' + user.id;
            //<img src="${user.foto}"></img> 

            //adiciono elementos dos usuários no html (id, foto, nome)
            $('#users').append($(
                `<b>${user.id}</b>
                <li style="${pStyle}">${user.nome}</li>
                <button id="${botId}">Confirma</button>
                <button id="${dica1}">Dica 1</button>
                <button id="${dica2}">Dica 2</button>
                <button id="${dica3}">Dica 3</button></li>
                <p>`
            ));
            console.log(user);

            //botao confirma (força ação do usuário)
            if (faseAtual <= 1) {
                $('#' + botId).click(function () {
                    socket.emit('interacao', { id: user.id, finalizado: true })
                    $('#' + botId).addClass("selecionado");
                })
            }



            /*------------------------------------------*/
            /*-------------------Dicas------------------*/
            /*------------------------------------------*/



            $('#' + dica1).click(function () {
                console.log("dica1")
                console.log(dica1);
                console.log(user.id);
                socket.emit('dica', { userId: user.id, tipo: 'muita' });
                $('#' + dica1).addClass("selecionado");
            })

            $('#' + dica2).click(function () {
                socket.emit('dica', { userId: user.id, tipo: 'media' });
                $('#' + dica2).addClass("selecionado");
            })

            $('#' + dica3).click(function () {
                console.log(dica3);
                console.log(user.id)
                socket.emit('dica', { userId: user.id, tipo: 'pouca' });
                $('#' + dica3).addClass("selecionado");
            })
        });

    });

    socket.on('request-users', function (data) {
        console.log('data');
        console.log(data);
    })

    socket.on('interacao', function (estadoInteracao) {

        logAtividades.push({ fase: faseAtual, usuariosLogados: usersLogados, interacao: estadoInteracao })
        // console.log(JSON.stringify(logAtividades))
        $('#faseLog').empty();
        $('#usersLog').empty();
        $('#interacaoLog').empty();

        logAtividades.forEach(atividade => {

            let interacaoArray = 0;
            let interacaoSize = 0;
            interacaoArray = JSON.parse(JSON.stringify(atividade.interacao.length))
            interacaoSize = interacaoArray.length;

            // $('#faseLog').append($(
            //     `<h4>${atividade.fase}</h4>`
            // ));
            
            // $('#usersLog').append($(
            //     `<h4>${JSON.stringify(atividade.usuariosLogados)}</h4>`
            // ));

            for (i = 0; i < interacaoSize; i++) {
                if (atividade.fase == 0) {
                    // $('#interacaoLog').append($(
                    //     `<h4>${atividade.interacao[i].id} - ${atividade.interacao[i].finalizado}✅</h4>`
                    // ));
                    
                } else if (atividade.fase == 1) {
                    // $('#interacaoLog').append($(
                    //     `<h4>${atividade.interacao[i].id} - ${atividade.interacao[i].botao}✅</h4>`
                    
                    // ));
                    
                }
            }
        })
        // console.log(estadoInteracao);
    })

    socket.on('sim', function (meuId) {
        console.log(meuId);
        socket.emit('sendmsg', 'oi', meuId);
        document.body.innerHTML = meuId;

    });
    socket.on('rcv-message', function (meuId) {
        document.body.innerHTML = meuId;
    });

});