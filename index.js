const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Crear el cliente con LocalAuth
const client = new Client({
    authStrategy: new LocalAuth()
});

// Confirmar cuando se haya autenticado
client.on('ready', () => {
    console.log('El bot está listo.');
});

// Este evento es opcional. Si la sesión ya está guardada, no se generará un QR.
client.on('qr', (qr) => {
    console.log('Escanea el código QR para iniciar sesión.');
});
// Función para responder con un formato de error en caso de comando incorrecto
function incorrectFormat(msg, correctUsage) {
    msg.reply(`⚠️ Formato incorrecto. Usa:\n\n${correctUsage}\n\nMrSethExe & BerlinData`);
}

// Lista de comandos disponibles
const commandsList = `
🌟 *Comandos Disponibles* 🌟
━━━━━━━━━━━━━━━━━━━━
🔍 /dni [DNI] - Consulta datos de un DNI.
🔍 /data [DNI] - Consulta información extendida de un DNI.
🔍 /nm [NOMBRES],[OTROS NOMBRES]-[APELLIDO PATERNO]-[APELLIDO MATERNO] - Consulta por nombres.
🔍 /tel [DNI] - Consulta por teléfono asociado a DNI.
🔍 /telnum [NÚMERO] - Consulta por número de teléfono.
━━━━━━━━━━━━━━━━━━━━
MrSethExe & BerlinData
`;

// Escuchar mensajes entrantes
client.on('message', async (msg) => {
    const args = msg.body.split(' ');

    // Comando de bienvenida
    if (msg.body === '/start') {
        msg.reply(`🌟 *Bienvenido a SETHDOXBOT-PREMIUM* 🌟\n\nUsa /cmds para ver la lista de comandos disponibles.\n\nMrSethExe & BerlinData`);
    }

    // Comando de lista de comandos
    if (msg.body === '/cmds') {
        msg.reply(commandsList);
    }

    // Comando /dni
    if (args[0] === '/dni') {
        const dni = args[1];
        if (!dni || dni.length !== 8 || isNaN(dni)) {
            return incorrectFormat(msg, '/dni [DNI de 8 dígitos]');
        }
        try {
            const response = await axios.get(`http://161.132.38.11:4010/api/basedatos/${dni}`);
            const result = response.data;

            if (result && result.DNI) {
                msg.reply(
                    `📊 *Consulta de DNI* 📊\n\n` +
                    `🆔 *DNI*: ${result.DNI}\n` +
                    `👤 *Nombre*: ${result.NOMBRES}\n` +
                    `👨‍👩‍👧 *Padre*: ${result.PADRE}\n` +
                    `👩‍👧 *Madre*: ${result.MADRE}\n` +
                    `💍 *Estado Civil*: ${result.EST_CIVIL}\n` +
                    `📅 *Fecha de Nacimiento*: ${result.FECHA_NAC}\n` +
                    `📅 *Fecha de Emisión*: ${result.FCH_EMISION}\n` +
                    `📅 *Fecha de Caducidad*: ${result.FCH_CADUCIDAD}\n` +
                    `📍 *Ubigeo*: ${result.UBIGEO_DIR}\n` +
                    `🏠 *Dirección*: ${result.DIRECCION}\n` +
                    `🔢 *Apellido Paterno*: ${result.AP_PAT}\n` +         // Agregado
                    `🔢 *Apellido Materno*: ${result.AP_MAT}\n` +         // Agregado
                    `🔢 *Dígito RUC*: ${result.DIG_RUC}\n` +               // Agregado
                    `📅 *Fecha de Inscripción*: ${result.FCH_INSCRIPCION}\n` + // Agregado
                    `🚻 *Sexo*: ${result.SEXO}\n` +                        // Agregado
                    `━━━━━━━━━━━━━━━━━━━━\nMrSethExe & BerlinData`
                );
            
            } else {
                msg.reply(`⚠️ No se encontraron datos para el DNI ${dni}.\n\nMrSethExe & BerlinData`);
            }
        } catch (error) {
            msg.reply('⚠️ Error al realizar la consulta. Inténtalo de nuevo.\n\nMrSethExe & BerlinData');
        }
    }

    // Comando /data
    if (args[0] === '/data') {
        const dni = args[1];
        if (!dni || dni.length !== 8 || isNaN(dni)) {
            return incorrectFormat(msg, '/data [DNI de 8 dígitos]');
        }
        try {
            const response = await axios.get(`http://localhost:3000/reniec/dni/${dni}`);
            const result = response.data;

            if (result && result.DNI) {
                msg.reply(
                    `📊 *Información Extendida* 📊\n\n` +
                    `🆔 *DNI*: ${result.DNI}\n` +
                    `👤 *Nombre Completo*: ${result.NOMBRES} ${result.AP_PAT} ${result.AP_MAT}\n` +
                    `💼 *Digito RUC*: ${result.DIG_RUC}\n` +
                    `📍 *Dirección*: ${result.DIRECCION}\n` +
                    `📅 *Fecha Inscripción*: ${result.FCH_INSCRIPCION}\n` +
                    `📅 *Fecha Nacimiento*: ${result.FECHA_NAC}\n` +
                    `━━━━━━━━━━━━━━━━━━━━\nMrSethExe & BerlinData`
                );
            } else {
                msg.reply(`⚠️ No se encontraron datos para el DNI ${dni}.\n\nMrSethExe & BerlinData`);
            }
        } catch (error) {
            msg.reply('⚠️ Error al realizar la consulta. Inténtalo de nuevo.\n\nMrSethExe & BerlinData');
        }
    }

    // Comando /nm
    if (args[0] === '/nm') {
        const query = args[1];
        if (!query || !query.match(/^[\w\s]+(,[\w\s]*)?-([\w\s]*)-([\w\s]*)?$/)) {
            return incorrectFormat(msg, '/nm NOMBRES,[OTROS NOMBRES]-APELLIDO PATERNO-APELLIDO MATERNO');
        }

        const [nombres, apellidoPaterno, apellidoMaterno] = query.split('-').map(part => part.trim());
        const nombreParam = nombres.split(',').map(n => n.trim()).join(' ');

        try {
            const response = await axios.get(`http://161.132.38.11:1033/nm_mpfn?apellidoPaterno=${apellidoPaterno}&apellidoMaterno=${apellidoMaterno}&nombres=${nombreParam}`);
            const results = response.data;

            if (results.length > 0) {
                let reply = '📊 *Resultados de Consulta* 📊\n\n';
                results.forEach((result) => {
                    reply += `👤 *Nombre*: ${result.nombres} ${result.apellidoPaterno} ${result.apellidoMaterno}\n🆔 *Documento*: ${result.numDocumento}\n━━━━━━━━━━━━\n`;
                });
                msg.reply(reply + 'MrSethExe & BerlinData');
            } else {
                msg.reply(`⚠️ No se encontraron coincidencias para la consulta ${nombreParam} ${apellidoPaterno} ${apellidoMaterno}.\n\nMrSethExe & BerlinData`);
            }
        } catch (error) {
            msg.reply('⚠️ Error al realizar la consulta. Inténtalo de nuevo.\n\nMrSethExe & BerlinData');
        }
    }

    // Comando /tel
    if (args[0] === '/tel') {
        const dni = args[1];
        if (!dni || dni.length !== 8 || isNaN(dni)) {
            return incorrectFormat(msg, '/tel [DNI de 8 dígitos]');
        }
        try {
            const response = await axios.get(`http://161.132.38.11:7412/telefono?documento=${dni}`);
            const results = response.data.listaAni;

            if (results.length > 0) {
                let reply = '📊 *Teléfonos Asociados* 📊\n\n';
                results.forEach((item) => {
                    reply += `📞 *Número*: ${item.numero}\n👤 *Titular*: ${item.titular}\n📅 *Fecha*: ${item.fecha}\n📲 *Fuente*: ${item.fuente}\n━━━━━━━━━━━━\n`;
                });
                msg.reply(reply + 'MrSethExe & BerlinData');
            } else {
                msg.reply(`⚠️ No se encontraron teléfonos asociados para el DNI ${dni}.\n\nMrSethExe & BerlinData`);
            }
        } catch (error) {
            msg.reply('⚠️ Error al realizar la consulta. Inténtalo de nuevo.\n\nMrSethExe & BerlinData');
        }
    }

    // Comando /telnum
    if (args[0] === '/telnum') {
        const numero = args[1];
        if (!numero || numero.length !== 9 || isNaN(numero)) {
            return incorrectFormat(msg, '/telnum [Número de 9 dígitos]');
        }
        try {
            const response = await axios.get(`http://161.132.38.11:7412/tel?numero=${numero}`);
            const results = response.data.listaAni;

            if (results.length > 0) {
                let reply = '📊 *Información de Número Telefónico* 📊\n\n';
                results.forEach((item) => {
                    reply += `📞 *Número*: ${item.numero}\n👤 *Titular*: ${item.titular}\n📅 *Fecha*: ${item.fecha}\n📲 *Fuente*: ${item.fuente}\n━━━━━━━━━━━━\n`;
                });
                msg.reply(reply + 'MrSethExe & BerlinData');
            } else {
                msg.reply(`⚠️ No se encontraron registros para el número ${numero}.\n\nMrSethExe & BerlinData`);
            }
        } catch (error) {
            msg.reply('⚠️ Error al realizar la consulta. Inténtalo de nuevo.\n\nMrSethExe & BerlinData');
        }
    }
});

// Iniciar cliente
client.initialize();
