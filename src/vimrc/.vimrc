"配色方案
colorscheme desert 
set t_Co=256

"显示行号
set nu

"高亮
syntax on

"vim键盘模式
set nocompatible

"tab缩进
set tabstop=4
set shiftwidth=4
set expandtab
set smarttab

"文件自动检测外部更改
set autoread

"自动对齐
set autoindent

"高亮查找匹配
set hlsearch

"显示匹配
set showmatch

"显示标尺，就是在右下角显示光标位置
set ruler

"去除vi的一致性
set nocompatible

"不要闪烁
set novisualbell

syntax on
filetype plugin indent on
nnoremap J 7j
nnoremap K 7k
vnoremap J 7j
vnoremap K 7k

let mapleader = "\<Space>"
nnoremap <C-Q> :q<CR>
inoremap <C-Q> <Esc>:q<CR>
nnoremap <C-S> :w<CR>
inoremap <C-S> <Esc>:w<CR>

" normal map
noremap <C-x> :join<CR>

" cursor
nnoremap ~ ^

" cp & paste                                                                                                                                                                                 
nnoremap <C-c> y$
nnoremap <C-v> p

" view
nnoremap <C-a> :vsp
inoremap <C-a> <ESC>:vsp
nnoremap <C-J> <C-W>w
nnoremap <C-K> <C-W>W
inoremap <C-J> <Esc><C-W>w                                                                                                                                                            
inoremap <C-K> <Esc><C-W>W
nnoremap + <C-W>>
nnoremap _ <C-W><

" replace
nnoremap <C-H> :%s/

" search
nnoremap <silent><F3> :noh<CR>
" delete$
nnoremap <silent><C-d> d$
nnoremap <silent><C-f> d^

" comments
nnoremap <silent><C-N> :s/^/\/\/<CR>:noh<CR>
nnoremap <silent><C-M> :s/^\/\//<CR>:noh<CR>

" terminal
nnoremap <silent><F4> :terminal<CR>
inoremap <silent><F4> <ESC>:terminal<CR>

noremap <C-T> :tabnew<CR>
set history=50      " keep 50 lines of command line history

" highlight cursorline
set cursorline
highlight CursorLine cterm=NONE ctermbg=black ctermfg=NONE guibg=NONE guifg=NONE
