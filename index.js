const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log("Cliente logueado");
});

client.on('message', message => {

    //variables
    let text = message.body.toLowerCase(); //mensaje recibido formateado a lowerCase
    let inicio = text.substring(13, 23);
    let fin = text.substring(24, 34);
    let bcv_change = text.substring(20, 30);
    let msg_f = "";
    let msg_f_hoy = "";
    let i = 1;
    let total = 0;
    let id_user = text.substring(0, 10);
    let difusion = text.substring(13, 1200); // !23 de enero + difusion

    //No envies audios
    if (message.type === 'voice' || message.type === 'audio' || message.type === 'ptt') {
        /*const { MessageMedia } = require('whatsapp-web.js');
        const media = MessageMedia.fromFilePath('img/ponk.png');
        client.sendMessage(message.from, media, { sendMediaAsSticker: true });*/
        client.sendMessage(message.from, 'Hola disculpe soy un bot! (Un sistema automatizado de mensajes) Y no puedo escuchar audios');
    }

    //Comando #1 presentacion del bot
    /*if (text === 'cheems') {
        client.sendMessage(message.from, 'Hola! soy Cheems tu asistente virtual de PuertoWifi la red amiga!, por favor escribe: *"cheems ayuda"*, para brindarte los comandos disponibles, si eres cliente, le brindamos diversas opciones que incluye nuestro asistente virtual *"Cheems Bot"*. \n \n Tambien contamos con las siguientes opciones: \n\n1: Consultar Fecha de corte. \n\n2: Solicitar soporte tecnico.\n\n3: Promociones.\n\n4: Métodos  de pagos.');
    }*/

    //Comando #2 muestra los comandos incorporados en el bot
    if (text === 'ayuda') {
        client.sendMessage(message.from, 'A continuacion se listan los comandos incorporados en el bot:');
        client.sendMessage(message.from, '*#1:* cheems: Muestra un mensaje presentando el Bot');
        //client.sendMessage(message.from, '*#2:* cheems ayuda: lista los comandos incorporados al bot');
        //client.sendMessage(message.from, '*#3:* Cheems hoy: muestra clientes deudores del dia de hoy: ' + now);
        //client.sendMessage(message.from, '*#4:* Cheems entre fecha inicial fecha final: muestra clientes cuya fecha de vencimiento esta entre las fechas especificadas (ejemplo cheems 2022-11-01 2022-11-7)');
        //client.sendMessage(message.from, '*#5:* cheems ver tasa: muestra la tasa actual registrada en el control de pagos');
        //client.sendMessage(message.from, '*#6:* cheems cambiar tasa tasa a actualizar: cambia la tasa bcv ejemplo cheems cambiar tasa a 7.87');
        //client.sendMessage(message.from, '*#7:* no tengo internet: Muestra mensaje de ayuda para el cliente');
        //client.sendMessage(message.from, '*#8:* ');
    }

    //formato de ejemplo para envio de mensajes 584124873468@c.us

    //Comando #3 muestra clientes cuya fecha de corte es hoy
    if (text === '!vencen-hoy') {
        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api')
            .then(function (response) {
                let today = new Date();//mover esto a cada funcion
                let now = today.toLocaleDateString('ve-es', { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                client.sendMessage(message.from, 'A continuacion se listan los clientes cuya fecha de corte es hoy: ' + now);
                response.data.forEach(cliente => {
                    msg_f_hoy += i + "- *" + cliente.full_name + ' ' + cliente.dir + ' ' + cliente.plan + "* Corte el dia: *" + cliente.cut + "* \n \n";
                    i++;
                    total += cliente.total;
                })
                client.sendMessage(message.from, msg_f_hoy);
                client.sendMessage(message.from, 'Dinero total por recolectar segun el precio de los planes: ' + total + '$');
            })
    }

    if (text === '!total-suspendidos') {
        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/get_sus/')
            .then(function (response) {
                response.data.forEach(cliente => {
                    msg_f += i + "- *" + cliente.full_name + ' ' + cliente.dir + ' ' + cliente.plan + "* Corte el dia: *" + cliente.cut + "* \n \n";
                    i++;
                    total += cliente.total;
                })
                client.sendMessage(message.from, 'A continuacion se listan los clientes suspendidos\n \n' + msg_f);
            })

        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/get_desc/')
            .then(function (response) {
                response.data.forEach(cliente => {
                    msg_f += i + "- *" + cliente.full_name + ' ' + cliente.dir + ' ' + cliente.plan + "* Corte el dia: *" + cliente.cut + "* \n \n";
                    i++;
                    total += cliente.total;
                })
                client.sendMessage(message.from, 'A continuacion se listan los clientes desactivados\n \n' + msg_f);
            })
    }

    //Comando #4 muestra clientes cuya fecha de vencimiento esta entre 2 fechas proporcionadas
    if (text === 'cheems entre ' + inicio + " " + fin) { //2023-01-01 2023-02-01
        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/get_users/' + inicio + '/' + fin)
            .then(function (response) {
                response.data.forEach(cliente => {
                    msg_f += i + "- *" + cliente.full_name + ' ' + cliente.dir + ' ' + cliente.plan + "* Corte el dia: *" + cliente.cut + "* \n \n";
                    i++;
                    total += cliente.total;
                })
                client.sendMessage(message.from, 'A continuacion se listan los clientes cuya fecha de corte esta entre el ' + inicio + ' y ' + fin + "\n \n" + msg_f);
                client.sendMessage(message.from, 'Dinero total por recolectar segun el precio de los planes: ' + total + '$');
            })
    }

    //comando #5 ver tasa actual
    if (text === 'ver tasa') {
        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/get_bcv/').then(function (response) {
            response.data.forEach(tasa => {
                let bcv = tasa.tasa;
                client.sendMessage(message.from, "Tasa actual BCV: " + bcv + "bs.");
            })
        })
    }

    //comando #6 cambiar tasa
    if (text === 'cheems cambiar tasa ' + bcv_change) {
        axios.post('http://190.120.248.192:56001/control_de_pago/public/api/test_api/change_bcv/' + bcv_change)
            .then(function (response) {
                client.sendMessage(message.from, "Tasa actual BCV a sido cambiada con exito! \n Tasa actual BCV: " + bcv_change);
            }).catch(function (error) {
                client.sendMessage(message.from, "Porfavor ingrese los datos validos, ejemplo cheems cambiar tasa 8.85");
                console.log(error);
            })
    }

    /*if (text == '2' || text.includes('no tengo internet') || text.includes('problemas con el internet') || text.includes('está intermitente') || text.includes('está lento') || text.includes('está malo')) {

        let today = new Date();
        let hora = today.toLocaleTimeString();

        let hora_inicio = '09:00:00';
        let hora_fin = '17:30:00';

        console.log(hora)

        if (hora_inicio <= hora && hora_fin >= hora) {
            client.sendMessage(message.from, 'Estimado usuario, para solicitar soporte comuniquese con nuestros numeros de atencion al cliente:\n\nPara usuarios de *FIBRA:*\nWa.me/+584244196944\n\nPara usuarios de *ANTENA:*\nWa.me/+584244946168\nRecuerde que nuestro horario comercial es el siguiente:\n\n*-.De lunes a sabado de 9:00 a.m. - 5:30p.m*\n*-.Domingo: Cerrado*');
        } else {
            client.sendMessage(message.from, 'Estimado usuario, en este momento el servicio de atencion al cliente se encuentra *Cerrado*.\n\nNuestro horario comercial es el siguiente:\n\n*-.De lunes a sabado de 9:00 a.m. - 5:30p.m*\n\n*-.Domingo: Cerrado*');
        }
    }*/

    /*if (text === 'no tengo internet') {
        const { MessageMedia } = require('whatsapp-web.js');
        const media = MessageMedia.fromFilePath('img/cheems_1.png');
        client.sendMessage(message.from, media, { sendMediaAsSticker: true });
    }*/

    if (text.includes('quien es') || text.includes('hola') || text.includes('quien eres')) {
        client.sendMessage(message.from, '*(EN DESARROLLO)* Hola! soy Cheems tu asistente virtual de PuertoWifi la red amiga! , estoy encargado en informarte y ayudarte en lo que pueda. Por favor escribe: *"ayuda"*, para brindarte una lista de comandos disponibles, si eres cliente le brindamos diversas opciones que incluye nuestro asistente virtual *"Cheems Bot"*. \n \n Tambien contamos con las siguientes opciones: \n\n1: Consultar Fecha de corte. \n\n2: Solicitar soporte tecnico.\n\n3: Promociones.\n\n4: Métodos  de pagos.');
    }

    //Comienzo de la logica para la opcion 1 
    if (text === '1') {
        client.sendMessage(message.from, 'Porfavor escriba su cedula de identidad\n Ejemplo 12345678 "sin puntos"');
    }

    //Consultar fecha de corte por cedula
    if (text === id_user && id_user.length > 6 && id_user.length < 9 && !isNaN(text)) {
        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/get_id/' + id_user).then(function (response) {
            let today = new Date();//mover esto a cada funcion
            let now = today.toLocaleDateString('ve-es', { weekday: "long", year: "numeric", month: "long", day: "numeric" });

            let cadena = response.data[1];
            let cedula = '';
            console.log(now)

            if (cadena != 'f') {
                const fecha_corte = new Date(response.data[0][0]['cut']).toLocaleDateString('ve-es', { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                cedula = response.data[0][0]['id_user'];
                client.sendMessage(message.from, "La fecha de suspension del cliente *" + response.data[0][0]['full_name'] + "* es el *" + response.data[0][0]['cut'] + "*");
                client.sendMessage(message.from, "Su plan actual: *" + response.data[0][0]['plan']);
            } else {
                cedula = "no registrada";
                console.log("Cedula no registrada en la base de datos, por favor acercarse a nuestras oficinas para actualizar los datos");
                client.sendMessage(message.from, "Cedula no registrada en la base de datos, por favor acercarse a nuestras oficinas para actualizar los datos");
            }
        });
    }
    //Fin de la logica de la opcion 1

    //Comienzo de la logica de la opcion 3
    if (text === '3') {
        const { MessageMedia } = require('whatsapp-web.js');

        const promo_1 = MessageMedia.fromFilePath('img/promo_1.jpeg');
        client.sendMessage(message.from, promo_1);
    }
    //Fin de la logica de la opcion 3

    //Comienzo de la logica de la opcion 4
    if (text === '4') {
        const { MessageMedia } = require('whatsapp-web.js');
        client.sendMessage(message.from, 'Puede acercarse a nuestras oficinas a realizar el pago:');
        const map_dir = MessageMedia.fromFilePath('img/dir.jpeg');
        client.sendMessage(message.from, map_dir);
        setTimeout(function () {
            client.sendMessage(message.from, 'https://goo.gl/maps/G8cttcr9Q8fiMkSj7');
            client.sendMessage(message.from, 'o puede optar por las siguientes opciones\n\nPagomovil: Tlf:0412-7520078 C.I:10249850 Provincial (0108)');
        }, 2000);
    }
    //Fin de la logica de la opcion 4

    if (message.type === 'location') {
        console.log(message.location)
    }

    //OJO FUNCION CON TEMPORIZADOR
    //Comienzo de logica para los mensajes de difusion
    if (text === '!23 de enero ' + difusion) {
        //formato de ejemplo para envio de mensajes 584124873468@c.us
        let contador = 1;
        let contador_1 = 1;
        let contador_0 = 0;
        let numero_formateado = "";

        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/get_23_enero')
            .then(function (response) {

                let tlf_aux = [];
                response.data.forEach(function (tlf, index) {
                    tlf_aux[index] = tlf['tlf'];
                });

                console.log('58' + tlf_aux[1] + '@c.us');

                let telefonos_cantidad = tlf_aux.length - 1;

                console.log(telefonos_cantidad)


                function send_message_delayed(i, max, time, interval) {
                    if (i > max) return;

                    for (j = 0; j <= 0; j++) {

                        if (tlf_aux[contador_0].includes('-')) {
                            numero_formateado = tlf_aux[contador_0].replace("-", "");
                        } else if (tlf_aux[contador_0].includes('+')) {
                            numero_formateado = tlf_aux[contador_0].replace("+", "");
                        } else {
                            numero_formateado = tlf_aux[contador_0];
                        }

                        if (numero_formateado.length <= 10) {
                            console.log(contador + ': Mensaje no enviado al numero: ' + numero_formateado)
                        } else {
                            console.log(contador + ': Mensaje enviado al numero: ' + numero_formateado.slice(1))
                            client.sendMessage('58' + numero_formateado.slice(1) + '@c.us', difusion);
                        }

                        contador_0 += 1;
                        contador += 1;
                    }

                    if (i == interval) {
                        time = 300000;
                        console.log("");
                        console.log("Retrasando tiempo de envio de mensajes (retraso numero " + contador_1 + ") ");
                        console.log("");
                        interval += 50;
                        contador_1 += 1;
                    } else {
                        time = 1;
                    }

                    setTimeout(function () { send_message_delayed(i, telefonos_cantidad - 1, time, interval); }, time);

                    i += 1;
                }

                send_message_delayed(0, telefonos_cantidad - 1, 1, 50);
                client.sendMessage('584124873468@c.us', difusion);
            })
    }

    //Fin de logica para los mensajes de difusion

    if (message.type === 'image' && message.from != 'status@broadcast') {
        client.sendMessage('120363046203550438@g.us', '---------');
        message.forward('120363046203550438@g.us');
        client.sendMessage('120363046203550438@g.us', message.body);
        client.sendMessage('120363046203550438@g.us', '---------');
    }

    //Logica para envio de mensaje de suspension de servicio cuando falten 2 y 1 dia :3
    if (text === '!auto-reporte') {
        let contador = 1;
        let contador_0 = 0;
        let contador_1 = 1;
        let numero_formateado = "";
        let send_confirm = 0; //si es "0" los mensajes no se han enviado aun, si es "1" el comando (!auto-report) no funcionara

        axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/send_confirm')
            .then(function (response) {
                send_confirm = response.data;
                console.log("paso 1 (sin timeout): Variable de confirmacion: " + send_confirm)
        });

        setTimeout(() => {

            axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/auto_report')
                .then(function (response) {
                    console.log("paso 2: segunda peticion para los numeros")
                    let tlf_aux = [];
                    let status_aux = [];
                    response.data.forEach(function (tlf, index) {
                        tlf_aux[index] = tlf['tlf'];
                    });

                    response.data.forEach(function (status, index) {
                        status_aux[index] = status['status'];
                    });

                    let telefonos_cantidad = tlf_aux.length - 1;

                    function send_message_delayed(i, max, time, interval) {
                        if (i > max) return;

                        for (j = 0; j <= 0; j++) {

                            if (tlf_aux[contador_0].includes('-')) {
                                numero_formateado = tlf_aux[contador_0].replace("-", "");
                            } else if (tlf_aux[contador_0].includes('+')) {
                                numero_formateado = tlf_aux[contador_0].replace("+", "");
                            } else {
                                numero_formateado = tlf_aux[contador_0];
                            }
                            if (status_aux[i] == 5) {// Restan 2 dias
                                if (numero_formateado.length <= 10) {
                                    console.log(contador_0 + ':(restan 2 dias) Mensaje no enviado al numero: ' + numero_formateado)
                                } else {
                                    console.log(contador_0 + ':(restan 2 dias) Mensaje enviado al numero: ' + numero_formateado.slice(1))
                                    client.sendMessage('58' + numero_formateado.slice(1) + '@c.us', '*Buenos días*, me gustaría notificar que su servicio se *vence en 2 dias*.\n\nEste es un sistema automático de mensajes\n\nMuchas gracias por su atención, Att. *Puerto Wifi*\n\n*nota: si usted ya ha realizado el pago correspondiente, ignore este mensaje automatico*');
                                }
                            } else if (status_aux[i] == 4) {// Resta 1 dia
                                if (numero_formateado.length <= 10) {
                                    console.log(contador_0 + ':(restan 1 dia) Mensaje no enviado al numero: ' + numero_formateado)
                                } else {
                                    console.log(contador_0 + ':(restan 1 dia) Mensaje enviado al numero: ' + numero_formateado.slice(1))
                                    client.sendMessage('58' + numero_formateado.slice(1) + '@c.us', '*Buenos días*, me gustaría notificar que su servicio se *vence en 1 dia*.\n\nEste es un sistema automático de mensajes\n\nMuchas gracias por su atención, Att. *Puerto Wifi*\n\n*nota: si usted ya ha realizado el pago correspondiente, ignore este mensaje automatico*');
                                }
                            } else if (status_aux[i] == 6) { // Dia de corte
                                if (numero_formateado.length <= 10) {
                                    console.log(contador_0 + ':(dia de corte) Mensaje no enviado al numero: ' + numero_formateado)
                                } else {
                                    console.log(contador_0 + ':(dia de corte) Mensaje enviado al numero: ' + numero_formateado.slice(1))
                                    client.sendMessage('58' + numero_formateado.slice(1) + '@c.us', '*Buenos días*, me gustaría notificar que su servicio se *vence hoy*.\n\nEste es un sistema automático de mensajes\n\nMuchas gracias por su atención, Att. *Puerto Wifi*\n\n*nota: si usted ya ha realizado el pago correspondiente, ignore este mensaje automatico*');
                                }
                            }
                            contador_0 += 1;
                            contador += 1;
                        }

                        if (i == interval) {
                            time = 5000;
                            console.log("");
                            console.log("Retrasando tiempo de envio de mensajes (retraso numero " + contador_1 + ") ");
                            console.log("");
                            interval += 50;
                            contador_1 += 1;
                        } else {
                            time = 1;
                        }

                        setTimeout(function () { send_message_delayed(i, telefonos_cantidad - 1, time, interval); }, time);

                        i += 1;
                    }


                    setTimeout(() => {
                        if (send_confirm == 1) {// 1 para indicar que se envio el reporte
                            send_message_delayed(contador_0, telefonos_cantidad - 1, 1, 24);
                            axios.get('http://190.120.248.192:56001/control_de_pago/public/api/test_api/change_confirm_0')
                            console.log("paso 3.0: Comando '!auto-reporte' desactivado variable de confirmacion cambiada a 0")
                        } else { // 0 para indicar que no se ha enviado el reporte
                            console.log("paso 3.1: variable de confirmacion : 0 por lo tanto ya se han enviado los mensajes del dia")
                        }

                    }, 2500);

                    /*
                        variable contadora                      i
                        total de telefonos                      max
                        retraso en ms                           time
                        intervalo entre mensajes enviados       interval
                    */

                })
        }, 5000);
    }

});//cierre del bot

client.initialize();