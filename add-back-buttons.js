import fs from 'fs';
import path from 'path';

const directoryPath = path.join(process.cwd(), 'src', 'pages');

const isInnerPage = (filename) => {
    const lower = filename.toLowerCase();
    return lower.includes('create') || 
           lower.includes('edit') || 
           lower.includes('details') || 
           lower.includes('report') || 
           lower.includes('lowstock') ||
           lower.includes('movement') ||
           lower.includes('daywise') ||
           lower.includes('receipt') ||
           lower.includes('payment') ||
           lower.includes('expense') ||
           lower.includes('request') ||
           lower.includes('ledger') ||
           lower.includes('roles') ||
           lower.includes('permissions');
};

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') && isInnerPage(path.basename(file))) {
                results.push(file);
            }
        }
    });
    return results;
};

const innerPages = walk(directoryPath);
let modifiedCount = 0;

innerPages.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it has PageHeader but doesn't have showBack already
    if (content.includes('<PageHeader') && !content.includes('showBack')) {
        content = content.replace(/<PageHeader/g, '<PageHeader showBack');
        fs.writeFileSync(file, content);
        console.log(`Updated: ${path.basename(file)}`);
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
