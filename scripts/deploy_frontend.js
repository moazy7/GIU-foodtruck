const fs = require('fs').promises;
const path = require('path');

async function copyDir(src, dest){
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for(const e of entries){
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if(e.isDirectory()) await copyDir(srcPath, destPath);
    else if(e.isFile()) await fs.copyFile(srcPath, destPath);
  }
}

async function main(){
  const repoRoot = path.resolve(__dirname, '..');
  const src = path.join(repoRoot, 'new_frontend');
  const dest = path.join(repoRoot, 'public', 'ui');
  try{
    console.log(`Copying from ${src} to ${dest}`);
    await copyDir(src, dest);
    console.log('Frontend deployed to public/ui');
  }catch(err){
    console.error('Deploy failed', err);
    process.exit(2);
  }
}

main();
