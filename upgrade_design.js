const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend/src/pages');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Buttons - Primary
  content = content.replace(/className="[^"]*bg-light-blue[^"]*text-white[^"]*"/g, 'className="btn-primary"');
  // Buttons - Secondary
  content = content.replace(/className="[^"]*bg-white border border-slate-200[^"]*text-light-text-secondary[^"]*"/g, 'className="btn-secondary"');
  
  // Table wrappers
  content = content.replace(/className="glass-card flex-1 flex flex-col min-h-0 p-0 overflow-hidden"/g, 'className="glass-card flex-1 flex flex-col min-h-0 p-0 overflow-hidden"'); // Actually glass-card is fine, we update it in index.css

  // Table Toolbar
  content = content.replace(/className="p-4 border-b border-slate-200\/80 flex items-center justify-between gap-4"/g, 'className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50"');

  // Search Input wrapper
  content = content.replace(/className="relative flex-1 max-w-md"/g, 'className="relative w-full sm:w-80"');

  // Search Input
  content = content.replace(/className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-light-blue\/20 focus:border-light-blue transition-all"/g, 'className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primaryLight focus:border-primary block w-full pl-9 p-2 outline-none transition-all"');

  // Table tags
  content = content.replace(/className="w-full min-w-\[800px\] text-left border-collapse"/g, 'className="w-full text-sm text-left text-gray-600 border-collapse min-w-[800px]"');
  content = content.replace(/className="w-full text-left border-collapse"/g, 'className="w-full text-sm text-left text-gray-600 border-collapse"');

  // Thead
  content = content.replace(/className="bg-slate-50\/80 sticky top-0 backdrop-blur-sm z-10"/g, 'className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200 sticky top-0 z-10"');

  // Th
  content = content.replace(/className="py-3 px-4 md:px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200/g, 'className="px-6 py-3 font-semibold border-b border-gray-200');
  content = content.replace(/className="py-3 px-6 text-xs font-semibold text-light-text-secondary uppercase tracking-wider border-b border-slate-200/g, 'className="px-6 py-3 font-semibold border-b border-gray-200');

  // Tr
  content = content.replace(/className="hover:bg-slate-50\/50 transition-colors"/g, 'className="bg-white border-b border-gray-100 hover:bg-blue-50/50 transition-colors"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(pagesDir, file));
  }
});

console.log("Done upgrading design globally.");
