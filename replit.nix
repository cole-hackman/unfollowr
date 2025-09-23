{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.python311Full
    pkgs.openssl
    pkgs.postgresql
  ];
}
