import {
  Activity, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, Atom, Award, Ban, BarChart3, BookCheck, BookOpen, Bot, Brain, Bug,
  Calculator, Calendar, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Circle, Clock, Copy, Crosshair, Crown, Database,
  DoorOpen, Download, ExternalLink, Eye, FileOutput, FileText, FileWarning, Flame, Folder, Footprints, Gauge, Gem, Globe, GripVertical,
  Hammer, Home, Info, KeyRound, Layers, LayoutGrid, Library, Lightbulb, ListChecks, ListOrdered, Lock, LockOpen, Mail, Map, Medal, Menu,
  MessageSquare, Minus, Moon, MousePointerClick, Network, Package, Pause, Pencil, Percent, Play, PlayCircle, Plug, Plus, Radar, Repeat,
  Rocket, RotateCcw, Route, Save, Scale, ScanEye, ScanSearch, ScrollText, Search, Send, Settings, Shield, ShieldAlert, ShieldCheck,
  ShieldX, Sigma, Sparkles, Split, Star, Sun, Swords, Target, Timer, Trash2, Trophy, Undo2, Upload, User, UserCheck, Users, Wallet,
  Wand2, Webhook, Workflow, Wrench, X, XCircle, Zap, type LucideIcon, type LucideProps,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  activity: Activity, 'alert-triangle': AlertTriangle, 'arrow-down': ArrowDown, 'arrow-left': ArrowLeft, 'arrow-right': ArrowRight,
  atom: Atom, award: Award, ban: Ban, 'bar-chart': BarChart3, 'book-check': BookCheck, 'book-open': BookOpen, bot: Bot, brain: Brain,
  bug: Bug, calculator: Calculator, calendar: Calendar, check: Check, 'check-circle': CheckCircle, 'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, circle: Circle, clock: Clock, copy: Copy, crosshair: Crosshair,
  crown: Crown, database: Database, 'door-open': DoorOpen, download: Download, 'external-link': ExternalLink, eye: Eye,
  'file-output': FileOutput, 'file-text': FileText, 'file-warning': FileWarning, flame: Flame, folder: Folder, footprints: Footprints,
  gauge: Gauge, gem: Gem, globe: Globe, grip: GripVertical, hammer: Hammer, home: Home, info: Info, key: KeyRound, layers: Layers,
  'layout-grid': LayoutGrid, library: Library, lightbulb: Lightbulb, 'list-checks': ListChecks, 'list-ordered': ListOrdered, lock: Lock,
  unlock: LockOpen, mail: Mail, map: Map, medal: Medal, menu: Menu, 'message-square': MessageSquare, minus: Minus, moon: Moon,
  pointer: MousePointerClick, network: Network, package: Package, pause: Pause, pencil: Pencil, percent: Percent, play: Play,
  'play-circle': PlayCircle, plug: Plug, plus: Plus, radar: Radar, repeat: Repeat, rocket: Rocket, 'rotate-ccw': RotateCcw, route: Route,
  save: Save, scale: Scale, 'scan-eye': ScanEye, 'scan-search': ScanSearch, 'scroll-text': ScrollText, search: Search, send: Send,
  settings: Settings, shield: Shield, 'shield-alert': ShieldAlert, 'shield-check': ShieldCheck, 'shield-x': ShieldX, sigma: Sigma,
  sparkles: Sparkles, split: Split, star: Star, sun: Sun, swords: Swords, target: Target, timer: Timer, trash: Trash2, trophy: Trophy,
  undo: Undo2, upload: Upload, user: User, 'user-check': UserCheck, users: Users, wallet: Wallet, wand: Wand2, webhook: Webhook,
  workflow: Workflow, wrench: Wrench, x: X, 'x-circle': XCircle, zap: Zap,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name] ?? Circle
  return <C aria-hidden="true" strokeWidth={1.9} {...props} />
}
