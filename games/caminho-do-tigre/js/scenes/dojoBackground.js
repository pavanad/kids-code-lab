function drawDojoBackground(ctx, width, height, groundY) {
  const ink = '#241811';
  const woodDark = '#3b2417';
  const woodMid = '#6d4226';

  // Parede iluminada do dojo.
  const wallGradient = ctx.createLinearGradient(0, 0, 0, groundY);
  wallGradient.addColorStop(0, '#4c2d20');
  wallGradient.addColorStop(0.18, '#8d5c35');
  wallGradient.addColorStop(0.75, '#c18b59');
  wallGradient.addColorStop(1, '#765032');
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, width, groundY);

  // Teto e vigas estruturais.
  ctx.fillStyle = '#17100d';
  ctx.fillRect(0, 0, width, 40);
  ctx.fillStyle = woodDark;
  ctx.fillRect(0, 40, width, 20);
  ctx.fillStyle = '#9a6338';
  ctx.fillRect(0, 44, width, 4);
  ctx.fillStyle = '#21140e';
  ctx.fillRect(0, 58, width, 12);

  const columns = [78, 220, 740, 882];
  columns.forEach((x) => {
    ctx.fillStyle = '#29170f';
    ctx.fillRect(x - 15, 56, 30, groundY - 56);
    ctx.fillStyle = woodMid;
    ctx.fillRect(x - 8, 62, 10, groundY - 68);
    ctx.fillStyle = '#a76b3a';
    ctx.fillRect(x - 5, 65, 3, groundY - 76);
  });

  // Janelas com céu e montanhas discretas.
  [20, width - 150].forEach((x) => {
    ctx.fillStyle = '#21150f';
    ctx.fillRect(x, 108, 130, 174);
    ctx.fillStyle = '#84b4cf';
    ctx.fillRect(x + 8, 116, 114, 132);
    ctx.fillStyle = '#d7e6e5';
    ctx.beginPath();
    ctx.moveTo(x + 8, 208);
    ctx.lineTo(x + 46, 160);
    ctx.lineTo(x + 76, 205);
    ctx.lineTo(x + 112, 145);
    ctx.lineTo(x + 122, 211);
    ctx.fill();
    ctx.fillStyle = '#497552';
    ctx.fillRect(x + 8, 214, 114, 34);
    ctx.strokeStyle = '#3b2619';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 42, 112);
    ctx.lineTo(x + 42, 252);
    ctx.moveTo(x + 84, 112);
    ctx.lineTo(x + 84, 252);
    ctx.moveTo(x + 4, 160);
    ctx.lineTo(x + 126, 160);
    ctx.moveTo(x + 4, 204);
    ctx.lineTo(x + 126, 204);
    ctx.stroke();
  });

  // Painel central com kanji e moldura de madeira.
  const panelW = 190;
  const panelH = 178;
  const panelX = width / 2 - panelW / 2;
  const panelY = 105;
  ctx.fillStyle = '#2b190f';
  ctx.fillRect(panelX - 13, panelY - 13, panelW + 26, panelH + 26);
  ctx.fillStyle = '#7d4b28';
  ctx.fillRect(panelX - 7, panelY - 7, panelW + 14, panelH + 14);
  ctx.fillStyle = '#e2c495';
  ctx.fillRect(panelX, panelY, panelW, panelH);
  const paperShade = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
  paperShade.addColorStop(0, 'rgba(255,255,255,0.26)');
  paperShade.addColorStop(1, 'rgba(114,65,31,0.18)');
  ctx.fillStyle = paperShade;
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.fillStyle = ink;
  ctx.font = 'bold 104px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('道', width / 2, panelY + panelH / 2 + 8);

  // Pergaminhos laterais.
  [-1, 1].forEach((side) => {
    const x = width / 2 + side * 155;
    ctx.fillStyle = '#2b190f';
    ctx.fillRect(x - 27, 132, 54, 166);
    ctx.fillStyle = '#a5271f';
    ctx.fillRect(x - 21, 140, 42, 150);
    ctx.fillStyle = '#e5b36f';
    ctx.fillRect(x - 25, 128, 50, 10);
    ctx.fillRect(x - 25, 292, 50, 10);
    ctx.fillStyle = '#27140f';
    ctx.font = 'bold 30px serif';
    ctx.save();
    ctx.translate(x, 215);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('空手', 0, 0);
    ctx.restore();
  });

  // Saco de pancada com corrente e volume.
  const bagX = width - 192;
  ctx.strokeStyle = '#171313';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bagX - 19, 80);
  ctx.lineTo(bagX - 15, 125);
  ctx.moveTo(bagX + 19, 80);
  ctx.lineTo(bagX + 15, 125);
  ctx.stroke();
  const bagGradient = ctx.createLinearGradient(bagX - 25, 0, bagX + 25, 0);
  bagGradient.addColorStop(0, '#641914');
  bagGradient.addColorStop(0.45, '#d53d2e');
  bagGradient.addColorStop(1, '#6f1914');
  ctx.fillStyle = bagGradient;
  ctx.beginPath();
  ctx.roundRect(bagX - 28, 120, 56, 172, 22);
  ctx.fill();
  ctx.strokeStyle = '#35110e';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,180,0.26)';
  ctx.beginPath();
  ctx.moveTo(bagX - 12, 143);
  ctx.lineTo(bagX - 12, 266);
  ctx.stroke();

  // Suporte de treino de madeira.
  const standX = 138;
  ctx.fillStyle = '#2d190e';
  ctx.fillRect(standX - 10, 232, 18, 170);
  ctx.fillRect(standX - 58, 262, 116, 15);
  ctx.fillRect(standX - 44, 322, 88, 14);
  ctx.fillStyle = '#80502b';
  ctx.fillRect(standX - 5, 237, 7, 158);
  ctx.fillRect(standX - 54, 265, 104, 5);
  ctx.fillRect(standX - 40, 325, 76, 5);
  ctx.fillStyle = '#1f150e';
  ctx.fillRect(standX - 18, 280, 32, 15);
  ctx.fillRect(standX - 18, 340, 32, 15);

  // Piso de madeira com tábuas em perspectiva e faixa de sombra.
  const floorGradient = ctx.createLinearGradient(0, groundY, 0, height);
  floorGradient.addColorStop(0, '#a76b3b');
  floorGradient.addColorStop(1, '#452719');
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = 'rgba(35, 20, 12, 0.48)';
  ctx.fillRect(0, groundY, width, 9);

  ctx.strokeStyle = 'rgba(47,25,13,0.62)';
  ctx.lineWidth = 2;
  for (let y = groundY + 20; y < height; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = -80; x < width + 80; x += 120) {
    ctx.beginPath();
    ctx.moveTo(width / 2 + (x - width / 2) * 0.5, groundY);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Pequenas marcas repetidas evitam um fundo plano sem cintilar a cada quadro.
  ctx.fillStyle = 'rgba(45, 24, 13, 0.25)';
  for (let x = 18; x < width; x += 67) {
    const y = groundY + 18 + ((x * 17) % 50);
    ctx.fillRect(x, y, 25, 2);
  }
}

window.drawDojoBackground = drawDojoBackground;
