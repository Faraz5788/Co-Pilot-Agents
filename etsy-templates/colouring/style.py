COLOURS = {"r": "#D94335", "g": "#3E9A57", "y": "#F4C243", "b": "#3D78C2", "o": "#F08A2C", "br": "#A8693D", "pk": "#F4A7B9",
           "sk": "#F6D2B1", "gr": "#B9B4AA", "lb": "#A9D6F2", "w": "#FFFFFF", "k2": "#2B2B2B", "k": "#111111"}
def css(coloured):
    out = ""
    for k, v in COLOURS.items():
        f = v if (coloured or k == "k") else "#FFFFFF"
        out += f".{k}{{fill:{f}}} .s{k}{{stroke:{f}}} "
    return out
